import React, {useState, useEffect} from "react";
import {socket} from "./socket";

const Editor = () => {
    const [text, setText]= useState("");

    useEffect(()=>{
        socket.on("load-document", (documentContent)=>{
            setText(documentContent);
        });

        socket.on("receive-changes", (delta)=>{
            setText(delta);
        });

        return ()=>{
            socket.off("load-document");
            socket.off("receive-changes");
        };

    }, []);

    const handelChange = (e)=>{
        const newText = e.target.value;
        setText(newText);
        socket.emit("sent-changes", newText);
    };

    return(
        <textarea
        value={text}
        onChange={handelChange}
        rows="20"
        cols="80"
        />
    )
}
export default Editor;