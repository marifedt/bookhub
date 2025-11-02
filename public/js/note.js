console.log('Note.js loaded successfully');

function toggleEdit(noteId) {
  const noteDisplay = document.getElementById(`noteContent-${noteId}`);
  const editButton = document.getElementById(`editBtn-${noteId}`);
  const saveButton = document.getElementById(`saveBtn-${noteId}`);

  const isEditing = noteDisplay.tagName.toLowerCase() === 'textarea';

  if(!isEditing){
    
    const currentContent = noteDisplay.textContent.trim();
    const textarea = document.createElement('textarea');

    textarea.id = `noteContent-${noteId}`;
    textarea.className = 'form-control w-full p-2 border rounded';
    textarea.rows = 3;
    textarea.value = currentContent;

    noteDisplay.parentNode.replaceChild(textarea, noteDisplay);

    editButton.style.display = 'none';
    saveButton.style.display = 'inline-block';
    
  } else{
    const updatedContent = noteDisplay.value;

    axios.patch(`/books/${olid}/note/${noteId}`, {
      content: updatedContent,
    })
    .then((res) => {
      if(res.data.success){
        console.log(`Note ${noteId} updated successfully.`);

        const newP = document.createElement('p');
        newP.id = `noteContent-${noteId}`;
        newP.className = 'text-gray-700 mb-2';
        newP.textContent = updatedContent;

        noteDisplay.parentNode.replaceChild(newP, noteDisplay);

        // Toggle buttons back
        saveButton.style.display = 'none';
        editButton.style.display = 'inline-block';

        const newFormattedDate = res.data.formatted_date;

        const dateElement = document.getElementById(`date-${noteId}`);

        if (dateElement) {
            dateElement.textContent = `Last updated on: ${newFormattedDate}`;
        }
      } else{
        alert('Error saving note: Server response failed.')
      }
    })
    .catch((error) =>{
      console.error('Patch error: ', error);
      alert('An error occurred while updating the note. Check server logs.');
    })
    
  }

}
