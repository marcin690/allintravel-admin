'use client'

import {useRef} from "react";
import JoditEditor from "jodit-react";
import joditConfig from "@/utils/joditConfig";

const RichTextEditor  = ({value, onChange}) => {
    const editor = useRef(null)

    return (
        <JoditEditor ref={editor} value={value} config={joditConfig} onBlur={newContent => onChange(newContent)}/>
        )

}

export default RichTextEditor