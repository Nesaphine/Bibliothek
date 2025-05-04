document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elemente ---
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');
    const darkModeToggle = document.getElementById('dark-mode-toggle');

    // Bibliothek
    const addBookBtn = document.getElementById('add-book-btn');
    const bookListContainer = document.getElementById('book-list');
    const bookFormModal = document.getElementById('book-form-modal');
    const bookForm = document.getElementById('book-form');
    const closeModalBtn = bookFormModal.querySelector('.close-btn');
    const cancelBookBtn = document.getElementById('cancel-book-btn');
    const modalTitle = document.getElementById('modal-title');
    const bookIdInput = document.getElementById('book-id');
    const bookImageInput = document.getElementById('book-image');
    const imagePreview = document.getElementById('image-preview');
    const bookImageBase64Input = document.getElementById('book-image-base64');
    const exportJsonBtn = document.getElementById('export-json-btn');

    // Filter Bibliothek
    const genreFilter = document.getElementById('genre-filter');
    const readFilter = document.getElementById('read-filter');
    const authorFilter = document.getElementById('author-filter');
    const nameFilter = document.getElementById('name-filter');
    const filterBtn = document.getElementById('filter-btn');
    const resetFilterBtn = document.getElementById('reset-filter-btn');


    // Statistik
    const statsTotalBooks = document.getElementById('stats-total-books');
    const statsTotalSpent = document.getElementById('stats-total-spent');
    const statsReadBooks = document.getElementById('stats-read-books');
    const statsUnreadBooks = document.getElementById('stats-unread-books');
    const statsMostExpensiveList = document.getElementById('stats-most-expensive');
    const statsLeastExpensiveList = document.getElementById('stats-least-expensive');

    // Wunschliste
    const addWishlistBtn = document.getElementById('add-wishlist-btn');
    const wishlistContainer = document.getElementById('wishlist-list');
    const wishlistFormModal = document.getElementById('wishlist-form-modal');
    const wishlistForm = document.getElementById('wishlist-form');
    const closeWishlistModalBtn = wishlistFormModal.querySelector('.close-wishlist-btn');
    const cancelWishlistBtn = document.getElementById('cancel-wishlist-btn');
    const wishlistModalTitle = document.getElementById('wishlist-modal-title');
    const wishlistIdInput = document.getElementById('wishlist-id');
    const wishlistImageInput = document.getElementById('wishlist-image');
    const wishlistImagePreview = document.getElementById('wishlist-image-preview');
    const wishlistImageBase64Input = document.getElementById('wishlist-image-base64');

    // Kalender
    const upcomingReleasesList = document.getElementById('upcoming-releases-list');


    // --- Datenhaltung (LocalStorage) ---
    let books = JSON.parse(localStorage.getItem('books')) || [];
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

    // --- Hilfsfunktionen ---
    const generateId = () => '_' + Math.random().toString(36).substr(2, 9);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        // Prüfen ob das Datum gültig ist, bevor es formatiert wird
        if (isNaN(date.getTime())) {
             return 'Ungültiges Datum';
        }
        // Korrekte Formatierung sicherstellen (könnte Probleme mit Zeitzonen haben)
        // Nutze UTC-Datumsteile, um Zeitzonenprobleme bei reiner Datumsanzeige zu vermeiden
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Monate sind 0-basiert
        const year = date.getUTCFullYear();
        return `${day}.${month}.${year}`;
    };

    const formatCurrency = (amount) => {
        const number = parseFloat(amount);
        return isNaN(number) ? '0.00' : number.toFixed(2);
    };

    // Bild als Base64 lesen
    const handleImageUpload = (fileInput, previewElement, base64InputElement, callback) => {
        const file = fileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                previewElement.src = reader.result;
                previewElement.style.display = 'block';
                base64InputElement.value = reader.result; // Speichere Base64 im versteckten Feld
                if (callback) callback(reader.result);
            }
            reader.readAsDataURL(file);
        } else {
             previewElement.style.display = 'none';
             previewElement.src = '#';
             base64InputElement.value = ''; // Leeren, wenn keine Datei gewählt
             if (callback) callback('');
        }
    };


    // --- Rendering Funktionen ---

    // Bücher rendern
    const renderBooks = (filteredBooks = books) => {
        bookListContainer.innerHTML = ''; // Leere den Container
        if (filteredBooks.length === 0) {
             bookListContainer.innerHTML = '<p>Keine Bücher in der Bibliothek gefunden.</p>';
             return;
        }

        filteredBooks.forEach(book => {
            const bookCard = document.createElement('div');
            bookCard.classList.add('book-card');
            bookCard.dataset.id = book.id; // ID für spätere Aktionen speichern

            bookCard.innerHTML = `
                <img src="${book.image || 'placeholder.png'}" alt="Buchcover von ${book.name}" onerror="this.onerror=null;this.src='placeholder.png';">
                <h3>${book.name}</h3>
                <p><strong>Autor:</strong> ${book.author}</p>
                <p><strong>Preis:</strong> ${formatCurrency(book.price)} €</p>
                <p><strong>Erschienen:</strong> ${formatDate(book.releaseDate)}</p>
                <p><strong>Genre:</strong> ${book.genre || 'Unbekannt'}</p>
                <p><strong>Status:</strong> ${book.isRead ? 'Gelesen' : 'Ungelesen'}</p>
                <div class="card-actions">
                    <div>
                        <button class="edit-btn">Bearbeiten</button>
                        <button class="delete-btn">Löschen</button>
                    </div>
                     <button class="fav-btn ${book.isFavorite ? 'favorited' : ''}" title="Favorit">⭐</button>
                 </div>
            `;

            // Event Listeners für die Buttons auf der Karte
            bookCard.querySelector('.edit-btn').addEventListener('click', () => openEditBookModal(book.id));
            bookCard.querySelector('.delete-btn').addEventListener('click', () => deleteBook(book.id));
            bookCard.querySelector('.fav-btn').addEventListener('click', (e) => toggleFavorite(book.id, e.target));

            bookListContainer.appendChild(bookCard);
        });
    };

    // Wunschliste rendern
    const renderWishlist = () => {
        wishlistContainer.innerHTML = '';
         if (wishlist.length === 0) {
             wishlistContainer.innerHTML = '<p>Deine Wunschliste ist leer.</p>';
             return;
        }

        wishlist.forEach(item => {
            const wishCard = document.createElement('div');
            wishCard.classList.add('wishlist-card');
            wishCard.dataset.id = item.id;

            wishCard.innerHTML = `
                <img src="${item.image || 'placeholder.png'}" alt="Cover von ${item.name}" onerror="this.onerror=null;this.src='placeholder.png';">
                <h3>${item.name}</h3>
                <p><strong>Autor:</strong> ${item.author}</p>
                <p><strong>Preis:</strong> ${formatCurrency(item.price)} €</p>
                <p><strong>Erscheint:</strong> ${formatDate(item.releaseDate)}</p>
                 <p><strong>Genre:</strong> ${item.genre || 'Unbekannt'}</p>
                ${item.shopLink ? `<a href="${item.shopLink}" target="_blank" class="shop-link">Zum Shop</a>` : ''}
                <div class="card-actions">
                    <button class="edit-wishlist-btn">Bearbeiten</button>
                    <button class="delete-wishlist-btn">Löschen</button>
                    <button class="bought-btn">Gekauft?</button>
                </div>
            `;

            wishCard.querySelector('.edit-wishlist-btn').addEventListener('click', () => openEditWishlistModal(item.id));
            wishCard.querySelector('.delete-wishlist-btn').addEventListener('click', () => deleteWishlistItem(item.id));
            wishCard.querySelector('.bought-btn').addEventListener('click', () => moveToLibrary(item.id));

            wishlistContainer.appendChild(wishCard);
        });
    };

     // Statistiken rendern/aktualisieren
    const renderStats = () => {
        const totalBooks = books.length;
        const totalSpent = books.reduce((sum, book) => sum + parseFloat(book.price || 0), 0);
        const readBooks = books.filter(book => book.isRead).length;
        const unreadBooks = totalBooks - readBooks;

        statsTotalBooks.textContent = totalBooks;
        statsTotalSpent.textContent = formatCurrency(totalSpent);
        statsReadBooks.textContent = readBooks;
        statsUnreadBooks.textContent = unreadBooks;

        // Teuerste / Günstigste Bücher
        const sortedByPrice = [...books].sort((a, b) => parseFloat(b.price || 0) - parseFloat(a.price || 0));

        statsMostExpensiveList.innerHTML = '';
        sortedByPrice.slice(0, 5).forEach(book => {
             const li = document.createElement('li');
             li.textContent = `${book.name} (${book.author}) - ${formatCurrency(book.price)} €`;
             statsMostExpensiveList.appendChild(li);
        });
         if (sortedByPrice.length === 0) statsMostExpensiveList.innerHTML = '<li>Keine Bücher vorhanden</li>';


        statsLeastExpensiveList.innerHTML = '';
        // Nur Bücher mit gültigem Preis > 0 berücksichtigen für die günstigsten
        const validPricedBooks = sortedByPrice.filter(b => parseFloat(b.price) > 0).reverse(); // reverse for ascending
        validPricedBooks.slice(0, 5).forEach(book => {
             const li = document.createElement('li');
             li.textContent = `${book.name} (${book.author}) - ${formatCurrency(book.price)} €`;
             statsLeastExpensiveList.appendChild(li);
        });
         if (validPricedBooks.length === 0) statsLeastExpensiveList.innerHTML = '<li>Keine Bücher mit Preisangabe > 0 vorhanden</li>';
    };

    // Kalender (Liste bevorstehender Releases) rendern
    const renderCalendar = () => {
        upcomingReleasesList.innerHTML = '';
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Zeit auf Mitternacht setzen für genauen Vergleich

        const upcoming = wishlist
            .filter(item => {
                const releaseDate = new Date(item.releaseDate);
                // Nur gültige Daten in der Zukunft oder heute berücksichtigen
                 return !isNaN(releaseDate.getTime()) && releaseDate >= today;
            })
            .sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate)); // Nach Datum sortieren

        if (upcoming.length === 0) {
            upcomingReleasesList.innerHTML = '<li>Keine bevorstehenden Veröffentlichungen in der Wunschliste.</li>';
            return;
        }

        upcoming.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `
                <strong>${formatDate(item.releaseDate)}:</strong> ${item.name} von ${item.author}
            `;
            upcomingReleasesList.appendChild(li);
        });
    };


    // --- Speicherfunktionen ---
    const saveBooks = () => {
        localStorage.setItem('books', JSON.stringify(books));
        applyFilters(); // Nach Speichern Filter neu anwenden (oder renderBooks() direkt)
        renderStats(); // Statistiken aktualisieren
    };

    const saveWishlist = () => {
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        renderWishlist();
        renderCalendar(); // Kalender auch aktualisieren
    };

    // --- Modal Funktionen (Buch) ---
    const openAddBookModal = () => {
        modalTitle.textContent = 'Buch hinzufügen';
        bookForm.reset(); // Formular leeren
        bookIdInput.value = ''; // Keine ID beim Hinzufügen
        imagePreview.style.display = 'none';
        imagePreview.src = '#';
        bookImageBase64Input.value = '';
        bookFormModal.style.display = 'block';
    };

     const openEditBookModal = (id) => {
        const book = books.find(b => b.id === id);
        if (!book) return;

        modalTitle.textContent = 'Buch bearbeiten';
        bookIdInput.value = book.id;
        document.getElementById('book-author').value = book.author;
        document.getElementById('book-name').value = book.name;
        document.getElementById('book-price').value = book.price;
        document.getElementById('book-release-date').value = book.releaseDate;
        document.getElementById('book-genre').value = book.genre;
        // Base64 Bild setzen und anzeigen
        bookImageBase64Input.value = book.image || '';
        if (book.image) {
            imagePreview.src = book.image;
            imagePreview.style.display = 'block';
        } else {
            imagePreview.style.display = 'none';
            imagePreview.src = '#';
        }
         // Reset file input (cannot programmatically set value)
        bookImageInput.value = null;

        bookFormModal.style.display = 'block';
    };

    const closeBookModal = () => {
        bookFormModal.style.display = 'none';
    };

     // --- Modal Funktionen (Wunschliste) ---
     const openAddWishlistModal = () => {
        wishlistModalTitle.textContent = 'Wunsch hinzufügen';
        wishlistForm.reset();
        wishlistIdInput.value = '';
        wishlistImagePreview.style.display = 'none';
        wishlistImagePreview.src = '#';
        wishlistImageBase64Input.value = '';
        wishlistFormModal.style.display = 'block';
    };

    const openEditWishlistModal = (id) => {
        const item = wishlist.find(w => w.id === id);
        if (!item) return;

        wishlistModalTitle.textContent = 'Wunsch bearbeiten';
        wishlistIdInput.value = item.id;
        document.getElementById('wishlist-author').value = item.author;
        document.getElementById('wishlist-name').value = item.name;
        document.getElementById('wishlist-price').value = item.price;
        document.getElementById('wishlist-release-date').value = item.releaseDate;
        document.getElementById('wishlist-genre').value = item.genre;
        document.getElementById('wishlist-shop-link').value = item.shopLink || '';
         // Base64 Bild setzen und anzeigen
        wishlistImageBase64Input.value = item.image || '';
        if (item.image) {
            wishlistImagePreview.src = item.image;
            wishlistImagePreview.style.display = 'block';
        } else {
            wishlistImagePreview.style.display = 'none';
            wishlistImagePreview.src = '#';
        }
         // Reset file input
        wishlistImageInput.value = null;

        wishlistFormModal.style.display = 'block';
    };

     const closeWishlistModal = () => {
        wishlistFormModal.style.display = 'none';
    };


    // --- CRUD Operationen (Buch) ---
    const handleBookFormSubmit = (event) => {
        event.preventDefault();
        const id = bookIdInput.value;
        const bookData = {
            id: id || generateId(),
            author: document.getElementById('book-author').value.trim(),
            name: document.getElementById('book-name').value.trim(),
            price: parseFloat(document.getElementById('book-price').value) || 0,
            releaseDate: document.getElementById('book-release-date').value,
            genre: document.getElementById('book-genre').value,
            image: bookImageBase64Input.value || null, // Verwende Base64 aus dem versteckten Feld
             // Standardwerte für neue Bücher
            isRead: id ? books.find(b => b.id === id)?.isRead : false, // Behalte Status bei Bearbeitung
            isFavorite: id ? books.find(b => b.id === id)?.isFavorite : false // Behalte Favorit bei Bearbeitung
        };

         // Validierung (einfach)
        if (!bookData.author || !bookData.name || !bookData.releaseDate || !bookData.genre) {
            alert('Bitte füllen Sie alle Pflichtfelder aus (Autor, Name, Erscheinungsdatum, Genre).');
            return;
        }


        if (id) { // Bearbeiten
            const index = books.findIndex(b => b.id === id);
            if (index > -1) {
                books[index] = bookData;
            }
        } else { // Hinzufügen
            books.push(bookData);
        }

        saveBooks();
        closeBookModal();
    };

    const deleteBook = (id) => {
        if (confirm('Möchten Sie dieses Buch wirklich löschen?')) {
            books = books.filter(b => b.id !== id);
            saveBooks();
        }
    };

    const toggleFavorite = (id, buttonElement) => {
        const index = books.findIndex(b => b.id === id);
        if (index > -1) {
            books[index].isFavorite = !books[index].isFavorite;
            buttonElement.classList.toggle('favorited', books[index].isFavorite); // Klasse direkt umschalten
            saveBooks(); // Speichern nach Änderung
             // Kein Neurendern der ganzen Liste nötig, nur Button-Style angepasst
        }
    };

     // --- CRUD Operationen (Wunschliste) ---
    const handleWishlistFormSubmit = (event) => {
        event.preventDefault();
        const id = wishlistIdInput.value;
        const wishData = {
            id: id || generateId(),
            author: document.getElementById('wishlist-author').value.trim(),
            name: document.getElementById('wishlist-name').value.trim(),
            price: parseFloat(document.getElementById('wishlist-price').value) || 0,
            releaseDate: document.getElementById('wishlist-release-date').value,
            genre: document.getElementById('wishlist-genre').value,
            shopLink: document.getElementById('wishlist-shop-link').value.trim() || null,
            image: wishlistImageBase64Input.value || null
        };

         // Validierung
        if (!wishData.author || !wishData.name || !wishData.releaseDate || !wishData.genre) {
             alert('Bitte füllen Sie alle Pflichtfelder aus (Autor, Name, Erscheinungsdatum, Genre).');
            return;
        }


        if (id) { // Bearbeiten
            const index = wishlist.findIndex(w => w.id === id);
            if (index > -1) {
                wishlist[index] = wishData;
            }
        } else { // Hinzufügen
            wishlist.push(wishData);
        }

        saveWishlist();
        closeWishlistModal();
    };

     const deleteWishlistItem = (id) => {
        if (confirm('Möchten Sie diesen Wunsch wirklich löschen?')) {
            wishlist = wishlist.filter(w => w.id !== id);
            saveWishlist();
        }
    };

     // Wunsch zu Bibliothek verschieben
     const moveToLibrary = (id) => {
         const itemIndex = wishlist.findIndex(w => w.id === id);
         if (itemIndex > -1) {
             const item = wishlist[itemIndex];
             if (confirm(`Möchten Sie "${item.name}" zur Bibliothek hinzufügen?`)) {
                 const newBook = {
                     id: generateId(), // Neue ID für das Buch
                     author: item.author,
                     name: item.name,
                     price: item.price,
                     releaseDate: item.releaseDate,
                     genre: item.genre,
                     image: item.image,
                     isRead: false, // Standardmäßig ungelesen
                     isFavorite: false // Standardmäßig kein Favorit
                 };
                 books.push(newBook);
                 wishlist.splice(itemIndex, 1); // Aus Wunschliste entfernen

                 saveBooks();
                 saveWishlist();
             }
         }
     };

    // --- Filterfunktion ---
    const applyFilters = () => {
        const genre = genreFilter.value;
        const readStatus = readFilter.value;
        const author = authorFilter.value.toLowerCase().trim();
        const name = nameFilter.value.toLowerCase().trim();

        let filtered = books.filter(book => {
            const matchesGenre = genre === 'all' || book.genre === genre;
            const matchesReadStatus = readStatus === 'all' || (readStatus === 'read' && book.isRead) || (readStatus === 'unread' && !book.isRead);
            const matchesAuthor = !author || book.author.toLowerCase().includes(author);
            const matchesName = !name || book.name.toLowerCase().includes(name);
            return matchesGenre && matchesReadStatus && matchesAuthor && matchesName;
        });
        renderBooks(filtered);
    };

    const resetFilters = () => {
        genreFilter.value = 'all';
        readFilter.value = 'all';
        authorFilter.value = '';
        nameFilter.value = '';
        applyFilters(); // Filter zurücksetzen und neu rendern
    };


    // --- Navigation ---
    const switchTab = (event) => {
        event.preventDefault();
        const targetId = event.target.getAttribute('href').substring(1); // z.B. 'bibliothek'

        // Alle Sektionen ausblenden und Links deaktivieren
        contentSections.forEach(section => section.classList.remove('active'));
        navLinks.forEach(link => link.classList.remove('active'));

        // Zielsektion anzeigen und Link aktivieren
        document.getElementById(targetId).classList.add('active');
        event.target.classList.add('active');

        // Daten für die aktive Sektion neu laden/rendern (optional, aber gut für Aktualität)
        switch (targetId) {
            case 'bibliothek':
                applyFilters(); // Filter anwenden beim Wechseln zur Bibliothek
                break;
            case 'statistik':
                renderStats();
                break;
            case 'wunschliste':
                renderWishlist();
                break;
            case 'kalender':
                renderCalendar();
                break;
        }
    };

    // --- Dark Mode ---
    const toggleDarkMode = () => {
        document.body.classList.toggle('dark-mode');
        // Präferenz im LocalStorage speichern
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('darkMode', 'enabled');
        } else {
            localStorage.setItem('darkMode', 'disabled');
        }
    };

    // Dark Mode beim Laden prüfen
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
    }

    // --- JSON Export ---
    const exportToJson = () => {
         if(books.length === 0) {
             alert("Keine Bücher zum Exportieren vorhanden.");
             return;
         }
        const dataStr = JSON.stringify(books, null, 2); // Pretty print JSON
        const dataBlob = new Blob([dataStr], {type: "application/json"});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'meine_bibliothek.json');
        document.body.appendChild(link); // Link muss im DOM sein für Firefox
        link.click();
        document.body.removeChild(link); // Aufräumen
        URL.revokeObjectURL(url); // Speicher freigeben
    };

    // --- Event Listener Zuweisungen ---

    // Navigation
    navLinks.forEach(link => link.addEventListener('click', switchTab));

    // Dark Mode
    darkModeToggle.addEventListener('click', toggleDarkMode);

    // Bibliothek Modal & Formular
    addBookBtn.addEventListener('click', openAddBookModal);
    closeModalBtn.addEventListener('click', closeBookModal);
    cancelBookBtn.addEventListener('click', closeBookModal);
    bookForm.addEventListener('submit', handleBookFormSubmit);
    // Listener für Bildvorschau (Buch)
    bookImageInput.addEventListener('change', () => handleImageUpload(bookImageInput, imagePreview, bookImageBase64Input));


    // Wunschliste Modal & Formular
    addWishlistBtn.addEventListener('click', openAddWishlistModal);
    closeWishlistModalBtn.addEventListener('click', closeWishlistModal);
    cancelWishlistBtn.addEventListener('click', closeWishlistModal);
    wishlistForm.addEventListener('submit', handleWishlistFormSubmit);
     // Listener für Bildvorschau (Wunschliste)
    wishlistImageInput.addEventListener('change', () => handleImageUpload(wishlistImageInput, wishlistImagePreview, wishlistImageBase64Input));


    // Filter
    filterBtn.addEventListener('click', applyFilters);
    resetFilterBtn.addEventListener('click', resetFilters);
    // Optional: Live-Filterung bei Eingabe
    // authorFilter.addEventListener('input', applyFilters);
    // nameFilter.addEventListener('input', applyFilters);
    // genreFilter.addEventListener('change', applyFilters);
    // readFilter.addEventListener('change', applyFilters);

    // JSON Export
    exportJsonBtn.addEventListener('click', exportToJson);


    // --- Initialisierung ---
    applyFilters(); // Initial Bücher anzeigen (mit Standardfiltern)
    renderWishlist(); // Initial Wunschliste anzeigen
    renderStats(); // Initial Statistiken berechnen
    renderCalendar(); // Initial Kalenderdaten laden

    // Schließen des Modals bei Klick außerhalb des Inhalts (optional)
    window.onclick = (event) => {
        if (event.target == bookFormModal) {
            closeBookModal();
        }
         if (event.target == wishlistFormModal) {
            closeWishlistModal();
        }
    };
});
