document.addEventListener('DOMContentLoaded', () => {
    const addBookBtn = document.getElementById('add-book-btn');
    const bookFormContainer = document.getElementById('book-form-container');
    const bookForm = document.getElementById('book-form');
    const bookList = document.getElementById('book-list');

    const localStorageKey = 'libraryBooks';
    let books = JSON.parse(localStorage.getItem(localStorageKey)) || [];

    addBookBtn.addEventListener('click', () => {
        bookFormContainer.classList.toggle('hidden');
    });

    bookForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newBook = {
            author: document.getElementById('author').value,
            name: document.getElementById('name').value,
            price: parseFloat(document.getElementById('price').value),
            date: document.getElementById('date').value,
            genre: document.getElementById('genre').value,
            read: false,
        };
        books.push(newBook);
        localStorage.setItem(localStorageKey, JSON.stringify(books));
        renderBooks();
        bookForm.reset();
        bookFormContainer.classList.add('hidden');
    });

    function renderBooks() {
        bookList.innerHTML = '';
        books.forEach((book, index) => {
            const bookDiv = document.createElement('div');
            bookDiv.classList.add('book-card');
            bookDiv.innerHTML = `
                <p><strong>${book.name}</strong> von ${book.author}</p>
                <p>Preis: ${book.price}€</p>
                <p>Genre: ${book.genre}</p>
                <p>Erscheinungsdatum: ${book.date}</p>
                <button onclick="deleteBook(${index})">Löschen</button>
            `;
            bookList.appendChild(bookDiv);
        });
    }

    window.deleteBook = (index) => {
        books.splice(index, 1);
        localStorage.setItem(localStorageKey, JSON.stringify(books));
        renderBooks();
    };

    renderBooks();
});
