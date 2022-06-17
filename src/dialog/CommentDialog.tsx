import TextareaAutosize from 'react-textarea-autosize';
import React from 'react';

export const CommentDialog = ({
    commentInput
}): JSX.Element => {

    return (
        <form>
            <h3 style={{ marginTop: 0, marginBottom: 5 }}>Comment Input:</h3>
            <div>
                <><div>
                    <div>
                        <TextareaAutosize
                            placeholder='Add your message here'
                            minRows={15}
                            defaultValue={commentInput}
                            style={{ width: 500, height: 250, fontSize: 14, whiteSpace: 'pre'}} 
                            autoFocus/>
                    </div>
                </div></>
            </div>
            <div></div>
        </form>
    );
}