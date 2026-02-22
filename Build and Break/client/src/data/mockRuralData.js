export const punjabRuralLocations = [
    "Samrala",
    "Jagraon",
    "Nabha",
    "Rajpura",
    "Khamano",
    "Khanna",
    "Doraha",
    "Machiwara"
];

// Replaced Unsplash URLs with highly reliable Pexels CDN IDs to fix broken images globally
const reliableImages = {
    lab1: "https://images.pexels.com/photos/3786157/pexels-photo-3786157.jpeg?auto=compress&cs=tinysrgb&w=800",
    lab2: "https://images.pexels.com/photos/3938022/pexels-photo-3938022.jpeg?auto=compress&cs=tinysrgb&w=800",
    lab3: "https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=800",
    lab4: "https://images.pexels.com/photos/3786128/pexels-photo-3786128.jpeg?auto=compress&cs=tinysrgb&w=800",
    lab5: "https://images.pexels.com/photos/4047073/pexels-photo-4047073.jpeg?auto=compress&cs=tinysrgb&w=800",
    hosp1: "https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg?auto=compress&cs=tinysrgb&w=800",
    hosp2: "https://images.pexels.com/photos/236380/pexels-photo-236380.jpeg?auto=compress&cs=tinysrgb&w=800",
    hosp3: "https://images.pexels.com/photos/247786/pexels-photo-247786.jpeg?auto=compress&cs=tinysrgb&w=800"
};

export const mockLabsData = {
    "Samrala": [
        {
            id: "sam-lab-1",
            name: "Dr. Lal PathLabs (Chandigarh Rd)",
            image: reliableImages.lab1,
            rating: 4.8,
            distance: "1.2 km",
            lat: 30.8360, lng: 76.1850,
            hours: "7:00 AM - 7:30 PM",
            tests: [
                { name: "Complete Blood Count (CBC)", price: "₹350" },
                { name: "Lipid Profile", price: "₹750" },
                { name: "Thyroid Profile (T3, T4, TSH)", price: "₹650" }
            ]
        },
        {
            id: "sam-lab-2",
            name: "Agilus Diagnostics (Formerly SRL)",
            image: reliableImages.lab2,
            rating: 4.7,
            distance: "1.5 km",
            lat: 30.8390, lng: 76.1900,
            hours: "7:30 AM - 8:00 PM",
            tests: [
                { name: "Complete Blood Count (CBC)", price: "₹330" },
                { name: "HbA1c (Diabetes)", price: "₹480" },
                { name: "Liver Function Test (LFT)", price: "₹800" }
            ]
        },
        {
            id: "sam-lab-3",
            name: "Thyrocare Aarogyam Centre",
            image: reliableImages.lab3,
            rating: 4.5,
            distance: "2.1 km",
            lat: 30.8320, lng: 76.1800,
            hours: "6:30 AM - 7:00 PM",
            tests: [
                { name: "Complete Blood Count (CBC)", price: "₹250" },
                { name: "Lipid Profile", price: "₹550" },
                { name: "Thyroid Profile (T3, T4, TSH)", price: "₹450" },
                { name: "Vitamin D", price: "₹1000" },
                { name: "Vitamin B12", price: "₹800" },
                { name: "Urine Routine", price: "₹150" }
            ]
        },
        {
            id: "sam-lab-4",
            name: "National Clinical Laboratory",
            image: reliableImages.lab4,
            rating: 4.4,
            distance: "0.8 km",
            lat: 30.8340, lng: 76.1890,
            hours: "8:00 AM - 8:30 PM",
            tests: [
                { name: "Complete Blood Count (CBC)", price: "₹280" },
                { name: "HbA1c (Diabetes)", price: "₹400" },
                { name: "Liver Function Test (LFT)", price: "₹650" },
                { name: "Kidney Function Test (KFT)", price: "₹750" },
                { name: "Vitamin D", price: "₹1100" }
            ]
        },
        {
            id: "sam-lab-5",
            name: "Sharma Health Care Laboratory",
            image: reliableImages.lab5,
            rating: 4.3,
            distance: "3.5 km",
            lat: 30.8450, lng: 76.1950,
            hours: "7:00 AM - 9:00 PM",
            tests: [
                { name: "Complete Blood Count (CBC)", price: "₹300" },
                { name: "Lipid Profile", price: "₹650" },
                { name: "Thyroid Profile (T3, T4, TSH)", price: "₹500" },
                { name: "HbA1c (Diabetes)", price: "₹420" },
                { name: "Liver Function Test (LFT)", price: "₹700" }
            ]
        }
    ],
    "Jagraon": [
        {
            id: "jag-lab-1",
            name: "Metropolis Healthcare (Dr Mona)",
            image: reliableImages.lab3,
            rating: 4.9,
            distance: "1.0 km",
            lat: 30.7800, lng: 75.4750,
            hours: "6:00 AM - 8:00 PM",
            tests: [
                { name: "Complete Blood Count (CBC)", price: "₹380" },
                { name: "Lipid Profile", price: "₹780" },
                { name: "Thyroid Profile (T3, T4, TSH)", price: "₹680" },
                { name: "Vitamin D", price: "₹1200" },
                { name: "Vitamin B12", price: "₹900" },
                { name: "Kidney Function Test (KFT)", price: "₹800" }
            ]
        },
        {
            id: "jag-lab-2",
            name: "Dr. Lal PathLabs (Kacha Malak Rd)",
            image: reliableImages.lab1,
            rating: 4.8,
            distance: "1.5 km",
            lat: 30.7850, lng: 75.4800,
            hours: "7:00 AM - 7:30 PM",
            tests: [
                { name: "Complete Blood Count (CBC)", price: "₹350" },
                { name: "HbA1c (Diabetes)", price: "₹500" },
                { name: "Liver Function Test (LFT)", price: "₹850" }
            ]
        },
        {
            id: "jag-lab-3",
            name: "Punjab Clinical Laboratory",
            image: reliableImages.lab2,
            rating: 4.6,
            distance: "0.5 km",
            lat: 30.7780, lng: 75.4700,
            hours: "8:00 AM - 8:00 PM",
            tests: [
                { name: "Complete Blood Count (CBC)", price: "₹280" },
                { name: "Lipid Profile", price: "₹600" },
                { name: "Thyroid Profile (T3, T4, TSH)", price: "₹520" },
                { name: "Basic Health Checkup", price: "₹1500" },
                { name: "Urine Routine", price: "₹200" }
            ]
        },
        {
            id: "jag-lab-4",
            name: "Jain Lab & X-Ray Clinic",
            image: reliableImages.lab4,
            rating: 4.5,
            distance: "2.0 km",
            lat: 30.7880, lng: 75.4850,
            hours: "8:30 AM - 6:30 PM",
            tests: [
                { name: "Complete Blood Count (CBC)", price: "₹300" },
                { name: "HbA1c (Diabetes)", price: "₹420" },
                { name: "Liver Function Test (LFT)", price: "₹700" },
                { name: "Vitamin D", price: "₹1050" },
                { name: "X-Ray Chest", price: "₹400" }
            ]
        },
        {
            id: "jag-lab-5",
            name: "Agilus Diagnostics (SRL)",
            image: reliableImages.lab5,
            rating: 4.7,
            distance: "2.5 km",
            lat: 30.7920, lng: 75.4900,
            hours: "7:00 AM - 8:00 PM",
            tests: [
                { name: "Complete Blood Count (CBC)", price: "₹330" },
                { name: "Lipid Profile", price: "₹700" },
                { name: "Thyroid Profile (T3, T4, TSH)", price: "₹600" },
                { name: "HbA1c (Diabetes)", price: "₹480" },
                { name: "Liver Function Test (LFT)", price: "₹800" }
            ]
        }
    ],
    "Nabha": [
        {
            id: "lab-nab-1",
            name: "Nabha Health Check Centre",
            image: reliableImages.lab1,
            rating: 4.9,
            distance: "1.5 km",
            lat: 30.3700, lng: 76.1500,
            hours: "8:00 AM - 8:00 PM",
            tests: [
                { name: "Complete Blood Count (CBC)", price: "₹350" },
                { name: "Lipid Profile", price: "₹600" },
                { name: "HbA1c", price: "₹400" },
                { name: "Vitamin B12", price: "₹850" },
                { name: "Thyroid Profile", price: "₹550" }
            ]
        },
        {
            id: "lab-nab-2",
            name: "Singla PathLab",
            image: reliableImages.lab3,
            rating: 4.6,
            distance: "0.8 km",
            lat: 30.3750, lng: 76.1450,
            hours: "7:00 AM - 7:00 PM",
            tests: [
                { name: "Liver Function Test (LFT)", price: "₹500" },
                { name: "Thyroid Profile", price: "₹450" }
            ]
        }
    ],
    "Rajpura": [
        {
            id: "lab-raj-1",
            name: "Rajpura Advanced Diagnostics",
            image: reliableImages.lab2,
            rating: 4.7,
            distance: "3.0 km",
            lat: 30.4850, lng: 76.5900,
            hours: "7:00 AM - 9:00 PM",
            tests: [
                { name: "Dengue Profile", price: "₹900" },
                { name: "Typhoid (Widal)", price: "₹250" },
                { name: "CBC", price: "₹350" }
            ]
        },
        {
            id: "lab-raj-2",
            name: "Garg MRI & Diagnostic Lab",
            image: reliableImages.lab4,
            rating: 4.8,
            distance: "1.2 km",
            lat: 30.4800, lng: 76.5950,
            hours: "24 Hours",
            tests: [
                { name: "MRI Scan (Brain)", price: "₹4500" },
                { name: "CT Scan (Abdomen)", price: "₹2500" },
                { name: "X-Ray Chest", price: "₹400" }
            ]
        }
    ],
    "Khamano": [
        {
            id: "lab-kham-1",
            name: "Khamano Digital X-Ray",
            image: reliableImages.lab1,
            rating: 4.5,
            distance: "1.0 km",
            lat: 30.8220, lng: 76.3200,
            hours: "8:00 AM - 6:00 PM",
            tests: [
                { name: "X-Ray Chest", price: "₹350" },
                { name: "Complete Blood Count (CBC)", price: "₹300" }
            ]
        }
    ],
    "Khanna": [
        {
            id: "lab-khan-1",
            name: "City Diagnostic Center",
            image: reliableImages.lab5,
            rating: 4.8,
            distance: "2.1 km",
            lat: 30.7040, lng: 76.2200,
            hours: "7:00 AM - 8:00 PM",
            tests: [
                { name: "Lipid Profile", price: "₹600" },
                { name: "Liver Function Test (LFT)", price: "₹750" },
                { name: "Thyroid Profile", price: "₹500" },
                { name: "Complete Blood Count (CBC)", price: "₹320" },
                { name: "Kidney Function Test (KFT)", price: "₹700" }
            ]
        }
    ],
    "Doraha": [
        {
            id: "lab-dor-1",
            name: "Doraha Path Lab",
            image: reliableImages.lab3,
            rating: 4.6,
            distance: "0.5 km",
            lat: 30.7950, lng: 76.0300,
            hours: "7:30 AM - 7:00 PM",
            tests: [
                { name: "HbA1c (Diabetes)", price: "₹450" },
                { name: "Complete Blood Count (CBC)", price: "₹280" }
            ]
        }
    ],
    "Machiwara": [
        {
            id: "lab-mach-1",
            name: "Machiwara Central Lab",
            image: reliableImages.lab2,
            rating: 4.7,
            distance: "1.8 km",
            lat: 30.9150, lng: 76.2000,
            hours: "7:00 AM - 7:30 PM",
            tests: [
                { name: "Dengue Profile", price: "₹850" },
                { name: "Thyroid Profile (T3, T4, TSH)", price: "₹550" },
                { name: "Lipid Profile", price: "₹650" }
            ]
        }
    ]
};

// V2 Hospitals Data Structure including Beds, Total Doctors, Specialists OPD timings, and GPS Coordinates
export const mockHospitalsData = {
    "Samrala": [
        {
            id: "hosp-sam-1",
            name: "Civil Hospital Samrala",
            image: reliableImages.hosp1,
            rating: 4.2,
            distance: "1.5 km",
            lat: 30.8385, lng: 76.1895,
            specialties: ["General Medicine", "Emergency", "Maternity"],
            bedsAvailable: 15,
            totalDoctors: 12,
            type: "Government",
            specialists: [
                { name: "Dr. A.K. Sharma", role: "Orthopedic", opdTiming: "9:00 AM - 1:00 PM", days: "Mon, Wed, Fri" },
                { name: "Dr. Sunita Verdi", role: "Gynaecologist", opdTiming: "10:00 AM - 2:00 PM", days: "Tue, Thu, Sat" },
                { name: "Dr. Rajeev Singh", role: "General Surgeon", opdTiming: "11:00 AM - 3:00 PM", days: "Mon to Sat" }
            ]
        },
        {
            id: "hosp-sam-2",
            name: "Guru Nanak Mission Hospital",
            image: reliableImages.hosp3,
            rating: 4.7,
            distance: "2.1 km",
            lat: 30.8300, lng: 76.1750,
            specialties: ["Orthopedics", "General Surgery", "Pediatrics"],
            bedsAvailable: 8,
            totalDoctors: 24,
            type: "Private",
            specialists: [
                { name: "Dr. Vikram Seth", role: "Pediatrician", opdTiming: "4:00 PM - 8:00 PM", days: "Mon to Fri" },
                { name: "Dr. Manjit Kaur", role: "Orthopedic", opdTiming: "9:00 AM - 12:00 PM", days: "Mon, Wed, Fri" }
            ]
        }
    ],
    "Jagraon": [
        {
            id: "hosp-jag-1",
            name: "Jagraon General Hospital",
            image: reliableImages.hosp2,
            rating: 4.5,
            distance: "1.0 km",
            lat: 30.7812, lng: 75.4780,
            specialties: ["Cardiology", "Neurology", "Emergency"],
            bedsAvailable: 22,
            totalDoctors: 18,
            type: "Private",
            specialists: [
                { name: "Dr. R.C. Gupta", role: "Cardiologist", opdTiming: "10:00 AM - 2:00 PM", days: "Mon, Wed, Fri" },
                { name: "Dr. Priya Desai", role: "Neurologist", opdTiming: "2:00 PM - 5:00 PM", days: "Tue, Thu" }
            ]
        },
        {
            id: "hosp-jag-2",
            name: "Lajpat Rai Memorial Hospital",
            image: reliableImages.hosp1,
            rating: 4.3,
            distance: "2.3 km",
            lat: 30.7900, lng: 75.4800,
            specialties: ["Maternity", "Pediatrics", "Ophthalmology"],
            bedsAvailable: 12,
            totalDoctors: 10,
            type: "Private",
            specialists: [
                { name: "Dr. Simran Kaur", role: "Gynaecologist", opdTiming: "10:00 AM - 4:00 PM", days: "Mon to Sat" }
            ]
        }
    ],
    "Nabha": [
        {
            id: "hosp-nab-1",
            name: "Civil Hospital Nabha",
            image: reliableImages.hosp1,
            rating: 4.1,
            distance: "0.5 km",
            lat: 30.3700, lng: 76.1480,
            specialties: ["General Medicine", "Maternity", "Dentistry"],
            bedsAvailable: 0,
            totalDoctors: 35,
            type: "Government",
            specialists: [
                { name: "Dr. N.K. Bansal", role: "Dentist", opdTiming: "9:00 AM - 1:00 PM", days: "Mon to Sat" },
                { name: "Dr. Kavita Verma", role: "Gynaecologist", opdTiming: "11:00 AM - 3:00 PM", days: "Mon, Wed, Fri" }
            ]
        },
        {
            id: "hosp-nab-2",
            name: "Sood Hospital",
            image: reliableImages.hosp2,
            rating: 4.6,
            distance: "1.8 km",
            lat: 30.3750, lng: 76.1420,
            specialties: ["Urology", "General Surgery", "Orthopedics"],
            bedsAvailable: 0,
            totalDoctors: 15,
            type: "Private",
            specialists: [
                { name: "Dr. V.K. Sood", role: "General Surgeon", opdTiming: "10:00 AM - 5:00 PM", days: "Mon to Sat" },
                { name: "Dr. Anjali Sood", role: "Pediatrician", opdTiming: "10:00 AM - 2:00 PM", days: "Mon, Wed, Fri" }
            ]
        },
        {
            id: "hosp-nab-3",
            name: "Singla Multispeciality Clinic",
            image: reliableImages.hosp3,
            rating: 4.8,
            distance: "2.4 km",
            lat: 30.3800, lng: 76.1550,
            specialties: ["Cardiology", "Neurology", "Physiotherapy"],
            bedsAvailable: 0,
            totalDoctors: 8,
            type: "Private",
            specialists: [
                { name: "Dr. Rajesh Singla", role: "Cardiologist", opdTiming: "9:00 AM - 1:00 PM", days: "Mon to Fri" }
            ]
        }
    ],
    "Rajpura": [
        {
            id: "hosp-raj-1",
            name: "A.P. Jain Civil Hospital",
            image: reliableImages.hosp3,
            rating: 4.6,
            distance: "2.5 km",
            lat: 30.4850, lng: 76.5950,
            specialties: ["Trauma Care", "General Surgery", "Medicine"],
            bedsAvailable: 45,
            totalDoctors: 40,
            type: "Government",
            specialists: [
                { name: "Dr. Sanjay Ahuja", role: "Trauma Specialist", opdTiming: "24/7", days: "Everyday" },
                { name: "Dr. Meena Rai", role: "General Medicine", opdTiming: "9:00 AM - 2:00 PM", days: "Mon to Sat" }
            ]
        },
        {
            id: "hosp-raj-2",
            name: "Neelam Hospital",
            image: reliableImages.hosp1,
            rating: 4.9,
            distance: "3.2 km",
            lat: 30.4900, lng: 76.5850,
            specialties: ["Oncology", "Neuro Science", "Advanced ICU"],
            bedsAvailable: 150,
            totalDoctors: 60,
            type: "Super Specialty",
            specialists: [
                { name: "Dr. Parminder Singh", role: "Neuro Surgeon", opdTiming: "11:00 AM - 3:00 PM", days: "Tue, Thu, Sat" },
                { name: "Dr. S.K. Bansal", role: "Oncologist", opdTiming: "9:00 AM - 1:00 PM", days: "Mon, Wed, Fri" }
            ]
        },
        {
            id: "hosp-raj-3",
            name: "Sanjivani Healthcare",
            image: reliableImages.hosp2,
            rating: 4.4,
            distance: "1.1 km",
            lat: 30.4800, lng: 76.6000,
            specialties: ["Ophthalmology", "Dental", "Dermatology"],
            bedsAvailable: 10,
            totalDoctors: 6,
            type: "Private Clinic",
            specialists: [
                { name: "Dr. Amit Verma", role: "Dermatologist", opdTiming: "5:00 PM - 8:00 PM", days: "Mon to Sat" }
            ]
        }
    ],
    "Khamano": [
        {
            id: "hosp-kham-1",
            name: "Khamano Medical Center",
            image: reliableImages.hosp1,
            rating: 4.2,
            distance: "1.2 km",
            lat: 30.8250, lng: 76.3250,
            specialties: ["General Medicine", "Pediatrics"],
            bedsAvailable: 10,
            totalDoctors: 5,
            type: "Private Clinic",
            specialists: [
                { name: "Dr. S. Singh", role: "General Medicine", opdTiming: "9:00 AM - 2:00 PM", days: "Mon to Sat" }
            ]
        }
    ],
    "Khanna": [
        {
            id: "hosp-khan-1",
            name: "Khanna Super Specialty Hospital",
            image: reliableImages.hosp2,
            rating: 4.8,
            distance: "2.5 km",
            lat: 30.7050, lng: 76.2250,
            specialties: ["Cardiology", "Orthopedics", "General Surgery"],
            bedsAvailable: 60,
            totalDoctors: 25,
            type: "Private",
            specialists: [
                { name: "Dr. R. K. Sharma", role: "Cardiologist", opdTiming: "10:00 AM - 4:00 PM", days: "Mon, Wed, Fri" },
                { name: "Dr. P. Kaur", role: "Orthopedic", opdTiming: "9:00 AM - 1:00 PM", days: "Tue, Thu, Sat" }
            ]
        }
    ],
    "Doraha": [
        {
            id: "hosp-dor-1",
            name: "Doraha Care Hospital",
            image: reliableImages.hosp3,
            rating: 4.4,
            distance: "0.8 km",
            lat: 30.7980, lng: 76.0350,
            specialties: ["Maternity", "General Surgery"],
            bedsAvailable: 15,
            totalDoctors: 8,
            type: "Private",
            specialists: [
                { name: "Dr. A. Verma", role: "Gynaecologist", opdTiming: "11:00 AM - 3:00 PM", days: "Mon to Fri" }
            ]
        }
    ],
    "Machiwara": [
        {
            id: "hosp-mach-1",
            name: "Machiwara Health Institute",
            image: reliableImages.hosp1,
            rating: 4.5,
            distance: "1.5 km",
            lat: 30.9180, lng: 76.2050,
            specialties: ["Emergency", "Pediatrics", "Ophthalmology"],
            bedsAvailable: 20,
            totalDoctors: 12,
            type: "Private",
            specialists: [
                { name: "Dr. K. S. Bhullar", role: "General Surgeon", opdTiming: "24/7", days: "Everyday" },
                { name: "Dr. M. S. Sidhu", role: "Pediatrician", opdTiming: "10:00 AM - 2:00 PM", days: "Mon, Wed, Fri" }
            ]
        }
    ]
};
