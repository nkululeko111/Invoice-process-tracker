# Invoice Management System

This is a simple and efficient Invoice Management System built using HTML, CSS, and JavaScript. It allows users to manage invoices, track payments, and generate reports. The application supports invoice creation, search and filtering, file uploads with OCR (Optical Character Recognition) for extracting invoice details from image and PDF files, and offers a dynamic chart for visualizing invoice statistics.

## Features

- **Invoice Management**: Add, view, and edit invoices. Each invoice includes details like date, amount, supplier, invoice number, and status.
- **Search & Filter**: Search and filter invoices by various parameters like invoice number, supplier, or amount.
- **File Upload with OCR**: Upload invoice images or PDFs, and extract details (amount, VAT, date, invoice number, etc.) using Tesseract.js for OCR processing.
- **Invoice Statistics**: Get real-time statistics such as the total amount of all invoices, pending invoice count, and supplier count.
- **Dark Mode Support**: Switch between light and dark modes for a customizable user experience.
- **Export Data**: Export the invoice data to CSV or other formats for external use.
- **Badges & Gamification**: Earn badges for milestones such as successfully uploading invoices with OCR.

## Requirements

- A modern web browser (Google Chrome, Firefox, Safari, Edge, etc.)
- An active internet connection for the OCR and PDF.js functionality

## Installation

1. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/nkululeko111/invoice-management-system.git
   ```

2. Open the `index.html` file in your browser to launch the application.

## Usage

### 1. **Invoice Creation**
   - Fill out the invoice form with details such as date, amount, VAT, supplier, invoice number, contact, and tracking number.
   - Submit the form to save the invoice.
   - The invoice will be displayed in a table along with the ability to edit or delete it.

### 2. **Search and Filter**
   - Use the search bar to find invoices based on invoice number, supplier, or amount.
   - Use the dropdown filter to narrow down invoices based on their status (e.g., Pending, Paid).

### 3. **File Upload with OCR**
   - Drag and drop an invoice image or PDF into the designated drop zone to upload it.
   - The system will automatically process the file and extract invoice details using OCR.
   - The extracted details will automatically fill in the invoice form.

### 4. **Statistics and Charts**
   - View real-time statistics such as the total invoice amount, the number of pending invoices, and the number of unique suppliers.
   - A chart visualizes the invoice statistics.

### 5. **Dark Mode**
   - Toggle dark mode using the switch to change the appearance of the application.

### 6. **Export Data**
   - Click the "Export" button to export the invoice data in CSV format.

## Technologies Used

- **HTML5**: For building the structure of the web pages.
- **CSS3**: For styling and ensuring responsiveness across devices.
- **JavaScript**: For handling the core functionality of the invoice management system.
- **Tesseract.js**: For performing OCR on invoice images and PDFs to extract text data.
- **PDF.js**: For extracting text from PDF documents.

## File Structure

```
/invoice-management-system
├── index.html              # Main HTML page
├── style.css               # Styles for the application
├── script.js               # JavaScript file containing all functionality
└── README.md               # Documentation for the project
```

## Contribution

Feel free to contribute by opening an issue or submitting a pull request. To contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -am 'Add new feature'`).
5. Push to the branch (`git push origin feature-branch`).
6. Open a pull request.

## License

This project is open-source and available under the [MIT License](LICENSE).

---

**Note**: This application uses Tesseract.js and PDF.js for OCR processing. Ensure you have an active internet connection to access the necessary libraries.

---

