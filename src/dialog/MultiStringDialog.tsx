import TextareaAutosize from 'react-textarea-autosize';
import React from 'react';

export const MultiStrDialog = ( {oldValue} ): JSX.Element => {

	return (
		<form>
			<h3 style={{ marginTop: 0, marginBottom: 5 }}>MultiString:</h3>
			<div>
				<><div>
					<div>
						<TextareaAutosize
							defaultValue= {oldValue}
							minRows={3}
							maxRows={15}
							name='multi-str'
							style={{ maxWidth: 640, width: 320, height: 150, fontSize: 12 }}
							autoFocus />
					</div>
				</div></>
			</div>
		</form>
	);
}
