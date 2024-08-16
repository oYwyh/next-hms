'use client'

import { useState, MouseEvent, useEffect, useRef } from 'react';
import { pdfjs, Document, Page } from 'react-pdf';
import { ChevronLeft, ChevronRight, Fullscreen, Trash2 } from "lucide-react";
import { Button } from '../Button';
import Link from 'next/link';
import { deleteFile } from '@/lib/r2';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { TUserMedicalFile } from '@/types/index.types';
import { invalidateQueries } from '@/lib/funcs';

export default function Pdf({ file, ownerId, s3 }: { file: TUserMedicalFile, ownerId: string | number, s3: boolean }) {

    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [isOwner, setIsOwner] = useState<boolean | undefined>(undefined)
    const [scale, setScale] = useState(1.0);
    const [isHovering, setIsHovering] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const src = s3 ? `${process.env.NEXT_PUBLIC_R2_FILES_URL}/${file.name}` : `${file.name}`;
    const queryClient = useQueryClient()

    const MIN_SCALE = 1.0;

    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.clientWidth;
                const newScale = containerWidth / 800; // Adjust 800 based on your PDF page width
                setScale(newScale < MIN_SCALE ? MIN_SCALE : newScale);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const { data: user } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            const response = await fetch('/api/user/info');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return await response.json();
        },
    })

    // Define the mutation for deleting the file
    const { mutateAsync } = useMutation({
        mutationFn: async ({ name, s3, id }: { name: string, s3: boolean, id: number }) => {
            await deleteFile({ name, s3, table: 'userFiles', id });
        },
        onSuccess: () => {
            invalidateQueries({ queryClient, key: ['files', String(file.folderId)] });
        },
    });

    useEffect(() => {
        setIsOwner(user?.id === ownerId)
    }, [user])

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setPageNumber(1);
    }

    function changePage(offset: number) {
        setPageNumber(prevPageNumber => prevPageNumber + offset);
    }

    function previousPage(e: MouseEvent<HTMLButtonElement>) {
        changePage(-1);
    }

    function nextPage(e: MouseEvent<HTMLButtonElement>) {
        changePage(1);
    }

    return (
        <>
            <div
                className="flex flex-col gap-2 w-full items-center justify-center relative"
                ref={containerRef}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
            >
                <Document
                    className={'z-10 rounded-lg shadow-lg'}
                    file={src}
                    onLoadSuccess={onDocumentLoadSuccess}
                >
                    <Page className={'rounded-lg relative z-20'} pageNumber={pageNumber}>
                        <div className='flex flex-row gap-3 absolute top-2 right-2 z-30'>
                            {isOwner && (
                                <Trash2
                                    color='#E6383C'
                                    className={`cursor-pointer shadow-lg opacity-0 transition-opacity ease-in-out ${isHovering && 'opacity-100'}`}
                                    onClick={async () => await mutateAsync({ name: file.name, s3, id: file.id })}
                                />
                            )}
                            <Link href={src} target="_blank" draggable={false} className={`cursor-pointer shadow-lg opacity-0 transition-opacity ease-in-out ${isHovering && 'opacity-100'}`}><Fullscreen /></Link>
                        </div>
                    </Page>
                </Document>
                <div className={`flex flex-row gap-2 items-center bg-white [box-shadow:0_30px_40px_0_rgba(16,_36,_94,_.2)] w-fit rounded-md absolute bottom-5 z-20 opacity-0 transition-opacity ease-in-out ${isHovering && 'opacity-100'}`}>
                    <Button
                        type="button"
                        disabled={pageNumber <= 1}
                        onClick={previousPage}
                        variant="ghost"
                        className="hover:bg-[#E6E6E6] transition w-fit p-1"
                    >
                        <ChevronLeft />
                    </Button>
                    <div className="flex flex-row gap-1">
                        <p>
                            {pageNumber || (numPages ? 1 : '--')} of {numPages || '--'}
                        </p>
                    </div>
                    <Button
                        type="button"
                        disabled={numPages ? pageNumber >= numPages : undefined}
                        onClick={nextPage}
                        variant="ghost"
                        className="hover:bg-[#E6E6E6] transition w-fit p-1"
                    >
                        <ChevronRight />
                    </Button>
                </div>
                <style>{`
                    .react-pdf__Page__canvas {
                        border-radius: 0.5rem;
                        max-width: 100%;
                    }
                `}</style>
            </div>
        </>
    )
}