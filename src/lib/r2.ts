'use server'

import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { validateRequest } from './auth'

const S3 = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
})

import crypto from 'crypto'
import db from './db'
import { userMedicalFilesTable } from './db/schema'
import { revalidatePath } from 'next/cache'
import { sql } from 'drizzle-orm'

const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')

const maxFileSize = 5 * 1024 * 1024 // 5MB

const acceptedTypes = ['image/jpg', 'image/png', 'image/jpeg', 'image/webp', 'application/pdf']

export async function getSignUrl(key: string | '', type: string, size: number, checkSum: string, folderId?: number) {
    const { user } = await validateRequest()

    if (!user) throw new Error('Unauthorized')

    if (size > maxFileSize) throw new Error('File size too large')
    if (!acceptedTypes.includes(type)) throw new Error('Unsupported file type')

    const fileName = generateFileName() + `-${key}`;
    const putObjectCommand = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME || '',
        Key: fileName,
        ContentType: type,
        ContentLength: size,
        ChecksumSHA256: checkSum,
        Metadata: {
            // so we can check which user uploaded it later in the frontend
            userId: user.id,
        }
    })

    const signedUrl = await getSignedUrl(S3, putObjectCommand, { expiresIn: 3600 })

    if (folderId) {
        await db.insert(userMedicalFilesTable).values({ name: fileName, folderId: folderId });
    }

    return {
        success: {
            url: signedUrl,
            fileName,
            folderId: folderId
        }
    }
}

export async function deleteFiles(names: { name: string, folderId: number }[], s3: boolean = false) {
    const { user } = await validateRequest()
    if (!user) throw new Error('Unauthorized')

    const userFolders = await db.query.userTable.findFirst({
        with: {
            folders: {
                with: {
                    files: true
                }
            }
        },
        where: (userTable, { eq }) => eq(userTable.id, user.id)
    });

    if (!userFolders) {
        throw new Error('No folders found for the user.');
    }


    for (const fileName of names) {
        const { name } = fileName;

        // Find the file in the user's folders
        const fileFound = userFolders.folders.some(folder =>
            folder.files.some(file => file.name === name)
        );

        if (fileFound) {
            if (s3) {
                console.log('lmfao work plz')
                const deleteObjectCommand = new DeleteObjectCommand({
                    Bucket: process.env.R2_BUCKET_NAME || '',
                    Key: name
                });

                try {
                    await S3.send(deleteObjectCommand);
                } catch (error) {
                    console.error(`Error deleting file from S3: ${name}`, error);
                    // Handle S3 deletion error (e.g., logging, retrying, etc.)
                }
            }

            try {
                await db.delete(userMedicalFilesTable).where(sql`${userMedicalFilesTable.name} = ${name}`);
            } catch (error) {
                console.error(`Error deleting file from database: ${name}`, error);
            }
        } else {
            console.warn(`File not found in user's folders: ${name}`);
        }
    }
}

export async function deleteFile(name: string, s3: boolean = false) {
    const { user } = await validateRequest()
    if (!user) throw new Error('Unauthorized')

    if (s3) {
        const deleteObjectCommand = new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME || '',
            Key: name
        });

        try {
            await S3.send(deleteObjectCommand);
        } catch (error) {
            console.error(`Error deleting file from S3: ${name}`, error);
            // Handle S3 deletion error (e.g., logging, retrying, etc.)
        }
    }

    try {
        await db.delete(userMedicalFilesTable).where(sql`${userMedicalFilesTable.name} = ${name}`);
    } catch (error) {
        console.error(`Error deleting file from database: ${name}`, error);
    }
}