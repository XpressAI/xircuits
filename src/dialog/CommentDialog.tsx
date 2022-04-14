import TextareaAutosize from 'react-textarea-autosize';
import React from 'react';

export const CommentDialog = ({
    commentInput
}): JSX.Element => {

    return (
        <form>
            <h3 style={{ marginTop: 0, marginBottom: 5 }}>Comment:</h3>
            <div>
                <><div>
                    <div>
                        <TextareaAutosize
                            placeholder='Comment here'
                            minRows={3}
                            maxRows={15}
                            defaultValue={commentInput}
                            style={{ width: 250, height: 100, fontSize: 14, whiteSpace: 'pre', }}
                            autoFocus />
                    </div>
                </div></>
            </div>
            <div></div>
        </form>
    );
}