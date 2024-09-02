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
import { userMedicalFilesTable, userTable } from './db/schema'
import { revalidatePath } from 'next/cache'
import { sql } from 'drizzle-orm'
import { fileTypes, imageTypes, tablesMap } from '@/constants'
import { deleteAction } from '@/actions/index.actions'

const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')

const maxFileSize = 5 * 1024 * 1024 // 5MB

export async function getSignUrl({
    key,
    type,
    size,
    checkSum,
    userId,
    pfp,
    table,
    imgsToDelete
}: {
    key: string | '',
    type: string,
    size: number,
    checkSum?: string,
    userId?: string,
    pfp?: boolean,
    table?: {
        table?: keyof typeof tablesMap,
        values?: any,
        queryKey?: any[],
        paths?: string[]
    },
    imgsToDelete?: {
        name: string,
        id?: number,
        table?: keyof typeof tablesMap,
        s3?: boolean
    }[],
}) {
    const { user } = await validateRequest()
    if (!user) throw new Error('Unauthorized')
    if (size > maxFileSize) throw new Error('File size too large')
    if (!userId) userId = user.id

    if (pfp && !imageTypes.includes(type)) throw new Error('Unsupported file type')
    if (!pfp && ![...imageTypes, ...fileTypes].includes(type)) throw new Error('Unsupported file type')

    const fileName = generateFileName() + `-${key}`;

    const putObjectCommand = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME || '',
        Key: fileName,
        ContentType: type,
        ContentLength: size,
        ChecksumSHA256: checkSum ? checkSum : undefined,
        Metadata: {
            // so we can check which user uploaded it later in the frontend
            userId: userId
        }
    })

    const signedUrl = await getSignedUrl(S3, putObjectCommand, { expiresIn: 3600 })

    if (table && table.table) {
        const tableDefinition = tablesMap[table.table];

        if (!tableDefinition) {
            throw new Error("Invalid table name");
        }

        if (fileName && Object.prototype.hasOwnProperty.call(tableDefinition, 'name')) {
            table.values['name'] = fileName
        }
        if (type && Object.prototype.hasOwnProperty.call(tableDefinition, 'type')) {
            table.values['type'] = type
        }

        await db.insert(tableDefinition).values(table.values);
    }

    if (pfp) {
        console.log('userId', userId)
        await db.update(userTable).set({ picture: fileName }).where(sql`${userTable.id} = ${userId}`);
    }

    if (imgsToDelete && imgsToDelete.length > 0) {
        imgsToDelete.forEach(async (img) => {
            await deleteFile({ name: img.name, s3: img.s3 ? true : false, table: img.table, id: img.id })
        })
    }

    return {
        success: {
            url: signedUrl,
            fileName,
        }
    }
}

export async function deleteFile({ name, s3 = false, table, id }: { name: string, s3: boolean, table?: keyof typeof tablesMap, id?: number }) {
    console.log(name, s3, table, id)
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
        if (table && id) {
            deleteAction(id, table)
        }
    } catch (error) {
        console.error(`Error deleting file from database: ${name}`, error);
    }
}