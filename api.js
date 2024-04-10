fetch('ETGAPIv3.postman_collection.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        const ulElement = document.createElement('ul');
        data.item.forEach(item => {
            const liElement = document.createElement('li');
            liElement.textContent = item.name;
            ulElement.appendChild(liElement); // Poprawione dodanie elementu li do elementu ul
        });
        document.getElementById('categoriesList').appendChild(ulElement);
    })
    .catch(error => {
        console.error('There was a problem with the fetch operator', error);
    });
