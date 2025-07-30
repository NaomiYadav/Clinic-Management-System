# Clinic Management System

A comprehensive web-based clinic management system that streamlines healthcare operations with modern technology and user-friendly interfaces. Built with HTML, CSS, JavaScript, and Firebase for secure data management.

## 🏥 Project Overview

The Clinic Management System is designed to facilitate seamless communication between doctors and receptionists while efficiently managing patient records, appointments, prescriptions, and billing. The system maintains a comprehensive patient history database that can be accessed by authorized personnel at any time.

## ✨ Features

### 🔐 User Authentication
- **Doctor Login**: Secure login system for medical practitioners
- **Receptionist Login**: Dedicated access for reception staff
- **Role-based Access Control**: Different permissions for different user types
- **User Registration**: Account creation with role assignment

### 👥 Patient Management
- **Patient Registration**: Complete patient information capture
- **Automatic Token Generation**: Sequential token numbering for queue management
- **Patient Status Tracking**: Real-time status updates (waiting, consulted, billed)
- **Patient Search**: Quick search by name or phone number
- **Patient History**: Comprehensive medical history tracking

### 🎫 Token System
- **Automatic Token Generation**: Sequential numbering for daily visits
- **Queue Management**: Real-time queue status and current token display
- **Token Status Tracking**: Waiting, in-progress, completed status
- **Daily Reset**: Automatic token numbering reset for each day

### 💊 Doctor Portal
- **Patient Queue View**: Display of waiting patients with token numbers
- **Prescription Management**: Digital prescription creation and storage
- **Patient History Access**: Complete medical history review
- **Consultation Tracking**: Mark patients as consulted

### 🧾 Billing System
- **Automated Bill Generation**: Professional bill creation with itemized services
- **Service Management**: Configurable medical services and pricing
- **Bill History**: Complete billing record maintenance
- **Print/Download**: PDF generation and printing capabilities

### 📱 Responsive Design
- **Mobile-Friendly**: Optimized for tablets and smartphones
- **Cross-Browser Compatible**: Works on all modern browsers
- **Intuitive UI**: User-friendly interface with modern design

## 🛠 Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Firebase (Firestore Database, Authentication)
- **Styling**: Custom CSS with responsive design
- **Icons**: Font Awesome
- **Database**: Firebase Firestore (NoSQL)

## 📁 Project Structure

```
Clinic-Management-System/
├── index.html              # Main HTML file
├── css/
│   └── styles.css          # Main stylesheet
├── js/
│   ├── config.js           # Firebase configuration
│   ├── auth.js             # Authentication module
│   ├── patient.js          # Patient management
│   ├── doctor.js           # Doctor portal functionality
│   ├── receptionist.js     # Receptionist dashboard
│   ├── billing.js          # Billing system
│   └── app.js              # Main application controller
├── README.md               # Project documentation
└── LICENSE                 # License file
```

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for Firebase services
- Text editor or IDE for code modifications

### Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/NaomiYadav/Clinic-Management-System.git
   cd Clinic-Management-System
   ```

2. **Firebase Setup**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication and Firestore Database
   - Get your Firebase configuration
   - Update `js/config.js` with your Firebase credentials:

   ```javascript
   const firebaseConfig = {
       apiKey: "your-api-key",
       authDomain: "your-project.firebaseapp.com",
       projectId: "your-project-id",
       storageBucket: "your-project.appspot.com",
       messagingSenderId: "your-sender-id",
       appId: "your-app-id"
   };
   ```

3. **Firestore Security Rules**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

4. **Launch the Application**
   - Open `index.html` in a web browser
   - Or use a local server (recommended):
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx http-server
   ```

## 👩‍⚕️ User Guide

### For Receptionists

1. **Register/Login**
   - Create account with receptionist role
   - Login with credentials

2. **Patient Registration**
   - Navigate to "Patient Registration" tab
   - Fill in patient details (name, age, gender, phone, address)
   - Select visit type (consultation, follow-up, emergency)
   - Submit to automatically generate token

3. **Token Management**
   - View all tokens for the current day
   - Monitor queue status and waiting patients
   - Track token completion status

4. **Billing**
   - Select consulted patient
   - Add consultation fee and additional services
   - Generate and print/download bills

### For Doctors

1. **Register/Login**
   - Create account with doctor role (include license number)
   - Login with credentials

2. **View Patients**
   - See all waiting patients with token numbers
   - Access patient information and history

3. **Write Prescriptions**
   - Select patient from dropdown
   - Enter diagnosis, medications, and instructions
   - Save prescription (automatically updates patient status)

4. **Patient History**
   - Search patients by name or phone
   - View complete medical history
   - Review previous prescriptions and treatments

## 🔧 Configuration

### Firebase Collections

The system uses the following Firestore collections:

- **users**: User authentication and role data
- **patients**: Patient information and status
- **tokens**: Daily token management
- **prescriptions**: Medical prescriptions and treatments
- **bills**: Billing information and history

### Customization

1. **Services and Pricing**: Modify the services array in `js/billing.js`
2. **Styling**: Update CSS variables in `css/styles.css`
3. **Functionality**: Extend modules in the `js/` directory

## 🧪 Testing

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Patient registration with token generation
- [ ] Doctor prescription workflow
- [ ] Billing and receipt generation
- [ ] Patient search and history
- [ ] Responsive design on mobile devices

### Test Data

Create test accounts:
- Doctor: `doctor@test.com` / `password123`
- Receptionist: `receptionist@test.com` / `password123`

## 🚀 Deployment

### Recommended: Vercel Deployment (Easiest)

The fastest way to deploy your Clinic Management System:

1. **Quick Deploy via Web Interface**
   - Go to [vercel.com](https://vercel.com) and sign up
   - Click "New Project" and import your GitHub repository
   - Configure as static site (no build required)
   - Deploy and get instant live URL

2. **Using Vercel CLI**
   ```bash
   npm install -g vercel
   vercel login
   vercel --prod
   ```

📖 **Detailed Guide**: See `QUICK_DEPLOY_GUIDE.md` for step-by-step instructions

### Alternative Deployment Options

**Firebase Hosting**
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

**Other Platforms**
- **Netlify**: Drag and drop project folder
- **GitHub Pages**: Enable in repository settings
- **Surge.sh**: `npm install -g surge && surge`

### Post-Deployment Setup
1. Update Firebase authorized domains with your live URL
2. Test all functionality on the live site
3. Monitor for any issues

🎉 **Live Demo**: Your deployed app will be available at `https://your-project.vercel.app`

## 🔒 Security Considerations

- Authentication required for all data access
- Role-based permissions implemented
- Input validation and sanitization
- Secure Firebase rules configuration
- HTTPS enforced in production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📋 Code Standards

- **Modular Design**: Separate concerns into different modules
- **ES6+ Features**: Use modern JavaScript features
- **Responsive Design**: Mobile-first approach
- **Accessibility**: ARIA labels and semantic HTML
- **Documentation**: Comprehensive code comments

## 🐛 Troubleshooting

### Common Issues

1. **Firebase Connection Error**
   - Verify Firebase configuration in `config.js`
   - Check internet connection
   - Ensure Firebase project is active

2. **Authentication Issues**
   - Verify Firebase Authentication is enabled
   - Check email/password requirements
   - Clear browser cache and cookies

3. **Data Not Loading**
   - Check Firestore security rules
   - Verify user has proper permissions
   - Check browser console for errors

## 📱 Browser Support

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Naomi Yadav**
- GitHub: [@NaomiYadav](https://github.com/NaomiYadav)

## 🙏 Acknowledgments

- Firebase for backend services
- Font Awesome for icons
- Healthcare professionals for workflow insights

## 📞 Support

For support, email support@example.com or create an issue on GitHub.

---

**Made with ❤️ for healthcare management**