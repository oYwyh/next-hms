'use client'

import { useState, MouseEvent } from 'react';
import { pdfjs, Document, Page } from 'react-pdf';
import { ChevronLeft, ChevronRight, Fullscreen, Trash2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/Dialog"
import { Button } from '../Button';
import Link from 'next/link';
import { deleteFile } from '@/lib/r2';
import { useQueryClient } from '@tanstack/react-query';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

export default function Pdf({ name }: { name: string }) {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);

    const queryClient = useQueryClient()

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
            <div className="flex flex-col gpa-2 items-center justify-center relative">
                <Document
                    className={'z-10 h-[800px] rounded-lg shadow-lg'}
                    file={`${process.env.NEXT_PUBLIC_R2_FILES_URL}/${name}`}
                    onLoadSuccess={onDocumentLoadSuccess}
                >
                    <Page className={'rounded-lg relative z-20'} pageNumber={pageNumber}>
                        <div className='flex flex-row gap-3 absolute top-2 right-2 z-30'>
                            <Trash2
                                className='cursor-pointer'
                                color='#E6383C'
                                onClick={async () => {
                                    await deleteFile(name, true)
                                    queryClient.invalidateQueries({ queryKey: ['files'] })
                                }}
                            />
                            <Link href={`${process.env.NEXT_PUBLIC_R2_FILES_URL}/${name}`} className='cursor-pointer'><Fullscreen /></Link>
                        </div>
                    </Page>
                </Document>
                <div className="flex flex-row gap-2 items-center bg-white [box-shadow:0_30px_40px_0_rgba(16,_36,_94,_.2)] w-fit rounded-md absolute bottom-5 z-20">
                    <Button
                        type="button"
                        disabled={pageNumber <= 1}
                        onClick={previousPage}
                        variant={"ghost"}
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
                        variant={"ghost"}
                        className="hover:bg-[#E6E6E6] transition w-fit p-1"
                    >
                        <ChevronRight />
                    </Button>
                </div>
                <style>{`
                    .react-pdf__Page__canvas {
                        border-radius: 0.5rem;
                    }
                `}</style>
            </div>
        </>
    )
}