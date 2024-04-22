import React from 'react';
import Dropzone from "react-dropzone";
import { CSSTransition } from 'react-transition-group';

const getStringSizeLengthFile = (size: number) => {
    const sizeKb = 1024;
    const sizeMb = sizeKb * sizeKb;
    const sizeGb = sizeMb * sizeKb;
    const sizeTerra = sizeGb * sizeKb;

    if(size < sizeMb)
        return (Math.round((size / sizeKb) * 100) / 100).toFixed(2) + " KB";
    else if (size < sizeGb)
        return (Math.round((size / sizeMb) * 100) /100).toFixed(2) + " MB";
    else if (size < sizeTerra)
        return (Math.round((size / sizeGb) * 100) / 100).toFixed(2) + " GB";

    return "";
};

const getExtension = (filename: string) => {
    const parts = filename.split(".");
    return parts[parts.length - 1];
}

interface DropzoneProps {
    onError: (errorMsg: string) => void;
    value: File[];
    onChange: (file: File[]) => void;
}

const DropzoneComponent: React.FC<DropzoneProps> = ({ onError, value, onChange }) => {

    const dropzoneHandler = (acceptedFiles: File[]) => {
        if(acceptedFiles.length > 1){
            onError("We only accept one file");
        }else if (acceptedFiles[0].size > 2097152){
            onError("File size should not be greater than 2MB");
        }else{
            onChange(acceptedFiles);
        }
    };

    return (
        <div className="mb-4">
            <Dropzone
                onDrop={dropzoneHandler}
                maxSize={2097152}
                multiple={false}
                accept={{
                    "image/*": [".png", ".gif", ".jpeg", ".jpg"],
                    "application/pdf": [],
                    "application/msword": [],
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                        [],
                }}
            >
                {({ getRootProps, getInputProps }) => (
                    <section>
                        <div
                            className="cursor-pointer w-full border-dotted border-black border-2 rounded-lg py-8 px-8"
                            {...getRootProps()}
                        >
                            <input {...getInputProps()} />
                            {value.length <= 0 ? (
                                <p className="text-center text-xs text-gray-200">
                                    Drag and drop your attachment here (Below 2MB)
                                    <br /> <br />
                                    <img
                                        className="mx-auto"
                                        src="/assets/icon/upload.svg" 
                                        alt="upload" 
                                    />
                                </p>
                            ) : (
                                <CSSTransition
                                    classNames="fade"
                                    in={true}
                                    timeout={500}
                                    appear={true}
                                >
                                    <div className="box">
                                        <div className="fold-corner-card relative">
                                            <h1 className="text-base font-base truncate mb-1">
                                                {value[0].name}
                                            </h1>
                                            <p className="truncate text-sm mb-1">
                                                {getStringSizeLengthFile(value[0].size)}
                                            </p>
                                            <p className="truncate text-sm mb-2">
                                                {getExtension(value[0].name)}
                                            </p>
                                        </div>
                                    </div>
                                </CSSTransition>
                            )}    
                        </div>
                    </section>
                )}
            </Dropzone>
        </div>
    )
}

export default DropzoneComponent;