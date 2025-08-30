class BusinessFinder {
    constructor() {
        this.apiKey = '';
        this.foundBusinesses = [];
        this.selectedLocations = [];
        this.searchHistory = this.loadSearchHistory();
        this.currentSearch = null;
        
        this.businessNiches = [
            { id: 'restaurant', name: 'Restaurants', keywords: ['restaurant', 'food', 'dining'] },
            { id: 'cafe', name: 'Cafes & Coffee Shops', keywords: ['cafe', 'coffee', 'bakery'] },
            { id: 'bar', name: 'Bars & Nightlife', keywords: ['bar', 'pub', 'nightclub'] },
            { id: 'beauty_salon', name: 'Beauty Salons', keywords: ['beauty_salon', 'hair_care', 'spa'] },
            { id: 'gym', name: 'Gyms & Fitness', keywords: ['gym', 'fitness', 'yoga'] },
            { id: 'car_repair', name: 'Auto Repair', keywords: ['car_repair', 'auto', 'mechanic'] },
            { id: 'plumber', name: 'Plumbers', keywords: ['plumber', 'plumbing'] },
            { id: 'electrician', name: 'Electricians', keywords: ['electrician', 'electrical'] },
            { id: 'dentist', name: 'Dentists', keywords: ['dentist', 'dental'] },
            { id: 'doctor', name: 'Doctors & Medical', keywords: ['doctor', 'medical', 'clinic'] },
            { id: 'lawyer', name: 'Lawyers & Legal', keywords: ['lawyer', 'legal', 'attorney'] },
            { id: 'accountant', name: 'Accountants', keywords: ['accountant', 'accounting', 'tax'] },
            { id: 'real_estate', name: 'Real Estate', keywords: ['real_estate_agency', 'realtor'] },
            { id: 'insurance', name: 'Insurance', keywords: ['insurance_agency', 'insurance'] },
            { id: 'veterinarian', name: 'Veterinarians', keywords: ['veterinary_care', 'pet'] },
            { id: 'pharmacy', name: 'Pharmacies', keywords: ['pharmacy', 'drugstore'] },
            { id: 'clothing_store', name: 'Clothing Stores', keywords: ['clothing_store', 'fashion'] },
            { id: 'shoe_store', name: 'Shoe Stores', keywords: ['shoe_store', 'footwear'] },
            { id: 'jewelry_store', name: 'Jewelry Stores', keywords: ['jewelry_store', 'jewelry'] },
            { id: 'electronics_store', name: 'Electronics Stores', keywords: ['electronics_store', 'computer'] },
            { id: 'furniture_store', name: 'Furniture Stores', keywords: ['furniture_store', 'home_goods'] },
            { id: 'hardware_store', name: 'Hardware Stores', keywords: ['hardware_store', 'tools'] },
            { id: 'florist', name: 'Florists', keywords: ['florist', 'flowers'] },
            { id: 'pet_store', name: 'Pet Stores', keywords: ['pet_store', 'pet_supply'] },
            { id: 'book_store', name: 'Book Stores', keywords: ['book_store', 'bookstore'] },
            { id: 'gas_station', name: 'Gas Stations', keywords: ['gas_station', 'fuel'] },
            { id: 'car_wash', name: 'Car Wash', keywords: ['car_wash', 'auto_detailing'] },
            { id: 'locksmith', name: 'Locksmiths', keywords: ['locksmith', 'keys'] },
            { id: 'moving_company', name: 'Moving Companies', keywords: ['moving_company', 'storage'] },
            { id: 'cleaning_service', name: 'Cleaning Services', keywords: ['cleaning', 'janitorial'] },
            { id: 'landscaping', name: 'Landscaping', keywords: ['landscaping', 'lawn_care'] },
            { id: 'roofing', name: 'Roofing Contractors', keywords: ['roofing_contractor', 'roofer'] },
            { id: 'painter', name: 'Painters', keywords: ['painter', 'painting'] },
            { id: 'contractor', name: 'General Contractors', keywords: ['general_contractor', 'construction'] },
            { id: 'hvac', name: 'HVAC Services', keywords: ['hvac', 'heating', 'air_conditioning'] },
            { id: 'pest_control', name: 'Pest Control', keywords: ['pest_control', 'exterminator'] },
            { id: 'security', name: 'Security Services', keywords: ['security', 'alarm'] },
            { id: 'travel_agency', name: 'Travel Agencies', keywords: ['travel_agency', 'travel'] },
            { id: 'hotel', name: 'Hotels & Lodging', keywords: ['lodging', 'hotel', 'motel'] },
            { id: 'taxi', name: 'Taxi & Transportation', keywords: ['taxi_stand', 'transportation'] },
            { id: 'storage', name: 'Storage Facilities', keywords: ['storage', 'self_storage'] },
            { id: 'laundromat', name: 'Laundromats', keywords: ['laundry', 'dry_cleaning'] },
            { id: 'bank', name: 'Banks & Credit Unions', keywords: ['bank', 'credit_union', 'atm'] },
            { id: 'school', name: 'Schools & Education', keywords: ['school', 'education', 'tutoring'] },
            { id: 'church', name: 'Churches & Religious', keywords: ['church', 'religious'] },
            { id: 'nonprofit', name: 'Non-Profit Organizations', keywords: ['nonprofit', 'charity'] },
            { id: 'government', name: 'Government Offices', keywords: ['government', 'municipal'] },
            { id: 'post_office', name: 'Post Offices', keywords: ['post_office', 'postal'] },
            { id: 'library', name: 'Libraries', keywords: ['library', 'books'] },
            { id: 'museum', name: 'Museums', keywords: ['museum', 'gallery'] },
            { id: 'amusement_park', name: 'Entertainment & Recreation', keywords: ['amusement_park', 'entertainment'] },
            { id: 'interior_designer', name: 'Interior Designers', keywords: ['interior_designer', 'interior_design'] },
            { id: 'architect', name: 'Architects', keywords: ['architect', 'architecture'] },
            { id: 'photographer', name: 'Photographers', keywords: ['photographer', 'photography'] },
            { id: 'wedding_planner', name: 'Wedding Planners', keywords: ['wedding_planner', 'wedding'] },
            { id: 'event_planner', name: 'Event Planners', keywords: ['event_planner', 'event'] },
            { id: 'catering', name: 'Catering Services', keywords: ['catering', 'caterer'] },
            { id: 'massage_therapist', name: 'Massage Therapists', keywords: ['massage_therapist', 'massage'] },
            { id: 'chiropractor', name: 'Chiropractors', keywords: ['chiropractor', 'chiropractic'] },
            { id: 'optometrist', name: 'Optometrists', keywords: ['optometrist', 'eye_care'] },
            { id: 'personal_trainer', name: 'Personal Trainers', keywords: ['personal_trainer', 'fitness_trainer'] },
            { id: 'nutritionist', name: 'Nutritionists', keywords: ['nutritionist', 'dietitian'] },
            { id: 'daycare', name: 'Daycare Centers', keywords: ['daycare', 'childcare'] },
            { id: 'tutoring', name: 'Tutoring Services', keywords: ['tutoring', 'tutor'] },
            { id: 'music_teacher', name: 'Music Teachers', keywords: ['music_teacher', 'music_lessons'] },
            { id: 'dance_studio', name: 'Dance Studios', keywords: ['dance_studio', 'dance'] },
            { id: 'martial_arts', name: 'Martial Arts Schools', keywords: ['martial_arts', 'karate', 'taekwondo'] },
            { id: 'auto_detailing', name: 'Auto Detailing', keywords: ['auto_detailing', 'car_detailing'] },
            { id: 'tire_shop', name: 'Tire Shops', keywords: ['tire_shop', 'tires'] },
            { id: 'auto_parts', name: 'Auto Parts Stores', keywords: ['auto_parts', 'car_parts'] },
            { id: 'appliance_repair', name: 'Appliance Repair', keywords: ['appliance_repair', 'appliance'] },
            { id: 'window_cleaning', name: 'Window Cleaning', keywords: ['window_cleaning', 'window'] },
            { id: 'carpet_cleaning', name: 'Carpet Cleaning', keywords: ['carpet_cleaning', 'carpet'] },
            { id: 'pool_service', name: 'Pool Services', keywords: ['pool_service', 'pool_cleaning'] },
            { id: 'tree_service', name: 'Tree Services', keywords: ['tree_service', 'tree_removal'] },
            { id: 'fence_contractor', name: 'Fence Contractors', keywords: ['fence_contractor', 'fencing'] },
            { id: 'concrete_contractor', name: 'Concrete Contractors', keywords: ['concrete_contractor', 'concrete'] },
            { id: 'driveway_contractor', name: 'Driveway Contractors', keywords: ['driveway_contractor', 'driveway'] },
            { id: 'handyman', name: 'Handyman Services', keywords: ['handyman', 'handyperson'] },
            { id: 'home_inspector', name: 'Home Inspectors', keywords: ['home_inspector', 'inspection'] },
            { id: 'solar_installer', name: 'Solar Installers', keywords: ['solar_installer', 'solar'] },
            { id: 'gutter_cleaning', name: 'Gutter Cleaning', keywords: ['gutter_cleaning', 'gutters'] },
            // New niches added
            { id: 'graphic_designer', name: 'Graphic Designers', keywords: ['graphic_designer', 'design', 'branding'] },
            { id: 'web_designer', name: 'Web Designers', keywords: ['web_designer', 'web_design', 'website'] },
            { id: 'marketing_consultant', name: 'Marketing Consultants', keywords: ['marketing_consultant', 'marketing', 'advertising'] },
            { id: 'business_consultant', name: 'Business Consultants', keywords: ['business_consultant', 'consulting'] },
            { id: 'financial_advisor', name: 'Financial Advisors', keywords: ['financial_advisor', 'financial_planning'] },
            { id: 'life_coach', name: 'Life Coaches', keywords: ['life_coach', 'coaching', 'counseling'] },
            { id: 'therapist', name: 'Therapists', keywords: ['therapist', 'therapy', 'counseling'] },
            { id: 'psychologist', name: 'Psychologists', keywords: ['psychologist', 'psychology'] },
            { id: 'podiatrist', name: 'Podiatrists', keywords: ['podiatrist', 'foot_care'] },
            { id: 'dermatologist', name: 'Dermatologists', keywords: ['dermatologist', 'skin_care'] },
            { id: 'orthodontist', name: 'Orthodontists', keywords: ['orthodontist', 'braces'] },
            { id: 'physical_therapist', name: 'Physical Therapists', keywords: ['physical_therapist', 'physical_therapy'] },
            { id: 'occupational_therapist', name: 'Occupational Therapists', keywords: ['occupational_therapist', 'occupational_therapy'] },
            { id: 'speech_therapist', name: 'Speech Therapists', keywords: ['speech_therapist', 'speech_therapy'] },
            { id: 'acupuncturist', name: 'Acupuncturists', keywords: ['acupuncturist', 'acupuncture'] },
            { id: 'naturopath', name: 'Naturopaths', keywords: ['naturopath', 'naturopathic'] },
            { id: 'midwife', name: 'Midwives', keywords: ['midwife', 'birthing'] },
            { id: 'dog_groomer', name: 'Dog Groomers', keywords: ['dog_groomer', 'pet_grooming'] },
            { id: 'dog_trainer', name: 'Dog Trainers', keywords: ['dog_trainer', 'pet_training'] },
            { id: 'pet_sitter', name: 'Pet Sitters', keywords: ['pet_sitter', 'pet_sitting'] },
            { id: 'dog_walker', name: 'Dog Walkers', keywords: ['dog_walker', 'dog_walking'] },
            { id: 'barber', name: 'Barbers', keywords: ['barber', 'barbershop'] },
            { id: 'nail_salon', name: 'Nail Salons', keywords: ['nail_salon', 'manicure', 'pedicure'] },
            { id: 'tattoo_artist', name: 'Tattoo Artists', keywords: ['tattoo_parlor', 'tattoo'] },
            { id: 'piercing_studio', name: 'Piercing Studios', keywords: ['piercing', 'body_piercing'] },
            { id: 'esthetician', name: 'Estheticians', keywords: ['esthetician', 'facial', 'skincare'] },
            { id: 'makeup_artist', name: 'Makeup Artists', keywords: ['makeup_artist', 'makeup'] },
            { id: 'hair_stylist', name: 'Hair Stylists', keywords: ['hair_stylist', 'hairdresser'] },
            { id: 'tailor', name: 'Tailors', keywords: ['tailor', 'alterations'] },
            { id: 'dry_cleaner', name: 'Dry Cleaners', keywords: ['dry_cleaning', 'laundry'] },
            { id: 'cobbler', name: 'Cobblers', keywords: ['cobbler', 'shoe_repair'] },
            { id: 'watch_repair', name: 'Watch Repair', keywords: ['watch_repair', 'jewelry_repair'] },
            { id: 'computer_repair', name: 'Computer Repair', keywords: ['computer_repair', 'tech_support'] },
            { id: 'phone_repair', name: 'Phone Repair', keywords: ['phone_repair', 'cell_phone_repair'] },
            { id: 'tv_repair', name: 'TV Repair', keywords: ['tv_repair', 'electronics_repair'] },
            { id: 'upholsterer', name: 'Upholsterers', keywords: ['upholsterer', 'furniture_repair'] },
            { id: 'antique_dealer', name: 'Antique Dealers', keywords: ['antique_store', 'antiques'] },
            { id: 'art_gallery', name: 'Art Galleries', keywords: ['art_gallery', 'art'] },
            { id: 'framing_shop', name: 'Framing Shops', keywords: ['picture_framing', 'framing'] },
            { id: 'music_store', name: 'Music Stores', keywords: ['music_store', 'instruments'] },
            { id: 'record_store', name: 'Record Stores', keywords: ['record_store', 'vinyl'] },
            { id: 'comic_book_store', name: 'Comic Book Stores', keywords: ['comic_book_store', 'comics'] },
            { id: 'hobby_shop', name: 'Hobby Shops', keywords: ['hobby_shop', 'crafts'] },
            { id: 'sporting_goods', name: 'Sporting Goods', keywords: ['sporting_goods_store', 'sports'] },
            { id: 'bike_shop', name: 'Bike Shops', keywords: ['bicycle_store', 'bike_repair'] },
            { id: 'outdoor_gear', name: 'Outdoor Gear', keywords: ['outdoor_equipment', 'camping'] },
            { id: 'fishing_shop', name: 'Fishing Shops', keywords: ['fishing_store', 'tackle'] },
            { id: 'hunting_shop', name: 'Hunting Shops', keywords: ['hunting_store', 'firearms'] },
            { id: 'pawn_shop', name: 'Pawn Shops', keywords: ['pawn_shop', 'second_hand'] },
            { id: 'thrift_store', name: 'Thrift Stores', keywords: ['thrift_store', 'consignment'] },
            { id: 'consignment_shop', name: 'Consignment Shops', keywords: ['consignment_shop', 'used_goods'] }
        ];
        
        this.initializeApp();
    }

    initializeApp() {
        console.log('Initializing app...');
        
        // Initialize components in order
        setTimeout(() => {
            this.renderNiches();
            this.initializeEventListeners();
            this.renderHistory();
            this.updateSelectedLocationsDisplay();
            
            // Double-check niches rendered
            setTimeout(() => {
                const nichesCount = document.querySelectorAll('.niche-item').length;
                console.log('Final niches check:', nichesCount, 'niches found');
                if (nichesCount === 0) {
                    console.log('Force rendering niches...');
                    this.renderNiches();
                }
            }, 100);
        }, 50);
    }

    renderNiches() {
        const nichesGrid = document.getElementById('nichesGrid');
        
        if (!nichesGrid) {
            console.error('nichesGrid element not found');
            return;
        }
        
        // Check if niches are already in HTML
        const existingNiches = nichesGrid.querySelectorAll('.niche-item');
        if (existingNiches.length > 0) {
            console.log('Niches already exist in HTML:', existingNiches.length, 'niches found');
            return;
        }
        
        console.log('No niches found, rendering from JavaScript...');
        
        // Create niches from the businessNiches array
        const nichesHtml = this.businessNiches.map(niche => `
            <div class="niche-item">
                <input type="checkbox" id="niche_${niche.id}" value="${niche.id}">
                <label for="niche_${niche.id}">${niche.name}</label>
            </div>
        `).join('');
        
        nichesGrid.innerHTML = nichesHtml;
        console.log('Niches rendered from JavaScript -', this.businessNiches.length, 'business types added');
    }

    initializeEventListeners() {
        // Search functionality
        const searchBtn = document.getElementById('searchBtn');
        const locationInput = document.getElementById('locationInput');
        
        // API key toggle
        const toggleApiKey = document.getElementById('toggleApiKey');
        
        // Niche selection
        const selectAllNiches = document.getElementById('selectAllNiches');
        const clearAllNiches = document.getElementById('clearAllNiches');
        const refreshNiches = document.getElementById('refreshNiches');
        
        // Export functionality
        const exportCsv = document.getElementById('exportCsv');
        const exportJson = document.getElementById('exportJson');
        const saveSearch = document.getElementById('saveSearch');
        
        // Tab functionality
        const tabButtons = document.querySelectorAll('.tab-btn');
        
        // History functionality
        const clearHistory = document.getElementById('clearHistory');
        
        // Test API button
        const testApiBtn = document.getElementById('testApiBtn');
        
        // Event listeners
        searchBtn.addEventListener('click', () => this.searchBusinesses());
        
        locationInput.addEventListener('input', (e) => this.handleLocationInput(e));
        locationInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addLocation(e.target.value);
            }
        });
        
        toggleApiKey.addEventListener('click', () => this.toggleApiKeyVisibility());
        if (selectAllNiches) selectAllNiches.addEventListener('click', () => this.selectAllNiches());
        if (clearAllNiches) clearAllNiches.addEventListener('click', () => this.clearAllNiches());
        if (refreshNiches) refreshNiches.addEventListener('click', () => this.renderNiches());
        exportCsv.addEventListener('click', () => this.exportToCsv());
        exportJson.addEventListener('click', () => this.exportToJson());
        saveSearch.addEventListener('click', () => this.saveCurrentSearch());
        
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });
        
        clearHistory.addEventListener('click', () => this.clearAllHistory());
        testApiBtn.addEventListener('click', () => this.testApiConnection());
        
        // Close suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.location-input-container')) {
                this.hideSuggestions();
            }
        });
        
        // Test function - you can call this in console
        window.testLocationSuggestions = (query) => {
            console.log('Testing with query:', query);
            const suggestions = this.getFallbackLocationSuggestions(query || 'dall');
            console.log('Results:', suggestions);
            this.showSuggestions(suggestions);
        };
        
        // Auto-test on page load
        setTimeout(() => {
            console.log('Auto-testing location suggestions...');
            window.testLocationSuggestions('dall');
        }, 2000);
    }

    // Location autocomplete functionality
    handleLocationInput(e) {
        const query = e.target.value.trim();
        console.log('Location input:', query);
        
        if (query.length < 2) {
            this.hideSuggestions();
            return;
        }
        
        // Use synchronous approach for better reliability
        const suggestions = this.getFallbackLocationSuggestions(query);
        console.log('Got suggestions:', suggestions);
        this.showSuggestions(suggestions);
    }

    async getLocationSuggestions(query) {
        console.log('getLocationSuggestions called with query:', query);
        // Get API key from input field
        const apiKey = document.getElementById('apiKeyInput').value.trim();
        console.log('API key present:', !!apiKey);
        
        if (!apiKey) {
            // Provide fallback suggestions without API
            console.log('Using fallback suggestions');
            return this.getFallbackLocationSuggestions(query);
        }
        
        try {
            const autocompleteUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&types=(cities)&key=${apiKey}`;
            
            // Try multiple CORS proxies
            const proxies = [
                'https://cors-anywhere.herokuapp.com/',
                'https://api.allorigins.win/raw?url=',
                'https://corsproxy.io/?',
                '' // Direct request as fallback
            ];
            
            for (const proxy of proxies) {
                try {
                    const response = await fetch(`${proxy}${autocompleteUrl}`);
                    const data = await response.json();
                    
                    if (data.status === 'OK') {
                        return data.predictions.slice(0, 5).map(prediction => ({
                            description: prediction.description,
                            place_id: prediction.place_id
                        }));
                    }
                } catch (error) {
                    console.warn(`Proxy ${proxy} failed:`, error);
                    continue;
                }
            }
        } catch (error) {
            console.error('Autocomplete error:', error);
        }
        
        // Fallback to static suggestions if API fails
        return this.getFallbackLocationSuggestions(query);
    }

    getFallbackLocationSuggestions(query) {
        const commonLocations = [
            // Major US Cities
            'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ',
            'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'San Jose, CA',
            'Austin, TX', 'Jacksonville, FL', 'Fort Worth, TX', 'Columbus, OH', 'Charlotte, NC',
            'San Francisco, CA', 'Indianapolis, IN', 'Seattle, WA', 'Denver, CO', 'Washington, DC',
            'Boston, MA', 'El Paso, TX', 'Nashville, TN', 'Detroit, MI', 'Oklahoma City, OK',
            'Portland, OR', 'Las Vegas, NV', 'Memphis, TN', 'Louisville, KY', 'Baltimore, MD',
            'Milwaukee, WI', 'Albuquerque, NM', 'Tucson, AZ', 'Fresno, CA', 'Sacramento, CA',
            'Mesa, AZ', 'Kansas City, MO', 'Atlanta, GA', 'Long Beach, CA', 'Colorado Springs, CO',
            'Raleigh, NC', 'Miami, FL', 'Virginia Beach, VA', 'Omaha, NE', 'Oakland, CA',
            'Minneapolis, MN', 'Tulsa, OK', 'Arlington, TX', 'Tampa, FL', 'New Orleans, LA',
            
            // Additional Major Cities
            'Buffalo, NY', 'Rochester, NY', 'Syracuse, NY', 'Albany, NY', 'Yonkers, NY',
            'Newark, NJ', 'Jersey City, NJ', 'Paterson, NJ', 'Elizabeth, NJ', 'Edison, NJ',
            'Pittsburgh, PA', 'Allentown, PA', 'Erie, PA', 'Reading, PA', 'Scranton, PA',
            'Orlando, FL', 'St. Petersburg, FL', 'Hialeah, FL', 'Tallahassee, FL', 'Fort Lauderdale, FL',
            'Savannah, GA', 'Augusta, GA', 'Columbus, GA', 'Macon, GA', 'Athens, GA',
            'Birmingham, AL', 'Montgomery, AL', 'Mobile, AL', 'Huntsville, AL', 'Tuscaloosa, AL',
            'Knoxville, TN', 'Chattanooga, TN', 'Clarksville, TN', 'Murfreesboro, TN', 'Franklin, TN',
            'Charleston, SC', 'Columbia, SC', 'North Charleston, SC', 'Mount Pleasant, SC', 'Rock Hill, SC',
            'Greensboro, NC', 'Durham, NC', 'Winston-Salem, NC', 'Fayetteville, NC', 'Cary, NC',
            'Richmond, VA', 'Norfolk, VA', 'Chesapeake, VA', 'Newport News, VA', 'Alexandria, VA',
            'Lexington, KY', 'Bowling Green, KY', 'Owensboro, KY', 'Covington, KY', 'Hopkinsville, KY',
            'Cincinnati, OH', 'Cleveland, OH', 'Toledo, OH', 'Akron, OH', 'Dayton, OH',
            'Grand Rapids, MI', 'Warren, MI', 'Sterling Heights, MI', 'Lansing, MI', 'Ann Arbor, MI',
            'Indianapolis, IN', 'Fort Wayne, IN', 'Evansville, IN', 'South Bend, IN', 'Carmel, IN',
            'Madison, WI', 'Green Bay, WI', 'Kenosha, WI', 'Racine, WI', 'Appleton, WI',
            'St. Paul, MN', 'Rochester, MN', 'Duluth, MN', 'Bloomington, MN', 'Brooklyn Park, MN',
            'Des Moines, IA', 'Cedar Rapids, IA', 'Davenport, IA', 'Sioux City, IA', 'Waterloo, IA',
            'St. Louis, MO', 'Springfield, MO', 'Independence, MO', 'Columbia, MO', 'Lee\'s Summit, MO',
            'Wichita, KS', 'Overland Park, KS', 'Kansas City, KS', 'Topeka, KS', 'Olathe, KS',
            'Lincoln, NE', 'Bellevue, NE', 'Grand Island, NE', 'Kearney, NE', 'Fremont, NE',
            'Fargo, ND', 'Bismarck, ND', 'Grand Forks, ND', 'Minot, ND', 'West Fargo, ND',
            'Sioux Falls, SD', 'Rapid City, SD', 'Aberdeen, SD', 'Brookings, SD', 'Watertown, SD',
            'Little Rock, AR', 'Fayetteville, AR', 'Springdale, AR', 'Jonesboro, AR', 'North Little Rock, AR',
            'Jackson, MS', 'Gulfport, MS', 'Southaven, MS', 'Hattiesburg, MS', 'Biloxi, MS',
            'Shreveport, LA', 'Baton Rouge, LA', 'Lafayette, LA', 'Lake Charles, LA', 'Kenner, LA',
            'Plano, TX', 'Laredo, TX', 'Lubbock, TX', 'Garland, TX', 'Irving, TX',
            'Boise, ID', 'Nampa, ID', 'Meridian, ID', 'Idaho Falls, ID', 'Pocatello, ID',
            'Salt Lake City, UT', 'West Valley City, UT', 'Provo, UT', 'West Jordan, UT', 'Orem, UT',
            'Billings, MT', 'Missoula, MT', 'Great Falls, MT', 'Bozeman, MT', 'Butte, MT',
            'Casper, WY', 'Cheyenne, WY', 'Laramie, WY', 'Gillette, WY', 'Rock Springs, WY',
            'Anchorage, AK', 'Fairbanks, AK', 'Juneau, AK', 'Sitka, AK', 'Ketchikan, AK',
            'Honolulu, HI', 'Pearl City, HI', 'Hilo, HI', 'Kailua, HI', 'Waipahu, HI',
            
            // California Cities
            'Fresno, CA', 'Long Beach, CA', 'Oakland, CA', 'Bakersfield, CA', 'Anaheim, CA',
            'Santa Ana, CA', 'Riverside, CA', 'Stockton, CA', 'Irvine, CA', 'Chula Vista, CA',
            'Fremont, CA', 'San Bernardino, CA', 'Modesto, CA', 'Fontana, CA', 'Oxnard, CA',
            'Moreno Valley, CA', 'Huntington Beach, CA', 'Glendale, CA', 'Santa Clarita, CA', 'Garden Grove, CA',
            
            // Texas Cities
            'Arlington, TX', 'Corpus Christi, TX', 'Plano, TX', 'Laredo, TX', 'Lubbock, TX',
            'Garland, TX', 'Irving, TX', 'Amarillo, TX', 'Grand Prairie, TX', 'Brownsville, TX',
            'McKinney, TX', 'Frisco, TX', 'Pasadena, TX', 'Killeen, TX', 'Carrollton, TX',
            
            // Florida Cities
            'Orlando, FL', 'St. Petersburg, FL', 'Hialeah, FL', 'Tallahassee, FL', 'Fort Lauderdale, FL',
            'Port St. Lucie, FL', 'Cape Coral, FL', 'Pembroke Pines, FL', 'Hollywood, FL', 'Miramar, FL',
            'Gainesville, FL', 'Coral Springs, FL', 'Miami Gardens, FL', 'Clearwater, FL', 'Palm Bay, FL'
        ];
        
        const filtered = commonLocations
            .filter(location => location.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 8)
            .map(location => ({
                description: location,
                place_id: null
            }));
        
        console.log('Fallback suggestions for query "' + query + '":', filtered);
        return filtered;
    }

    showSuggestions(suggestions) {
        console.log('showSuggestions called with:', suggestions);
        
        const suggestionsContainer = document.getElementById('locationSuggestions');
        if (!suggestionsContainer) {
            console.error('locationSuggestions container not found!');
            return;
        }
        
        if (!suggestions || suggestions.length === 0) {
            this.hideSuggestions();
            return;
        }
        
        // Clear existing content
        suggestionsContainer.innerHTML = '';
        
        // Create suggestion items
        suggestions.forEach(suggestion => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.textContent = suggestion.description;
            item.style.padding = '10px 15px';
            item.style.cursor = 'pointer';
            item.style.borderBottom = '1px solid #eee';
            
            item.addEventListener('mouseenter', () => {
                item.style.backgroundColor = '#f5f5f5';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.backgroundColor = 'white';
            });
            
            item.addEventListener('click', () => {
                this.addLocation(suggestion.description);
            });
            
            suggestionsContainer.appendChild(item);
        });
        
        // Show the container with explicit styling
        suggestionsContainer.classList.remove('hidden');
        suggestionsContainer.style.display = 'block';
        suggestionsContainer.style.position = 'absolute';
        suggestionsContainer.style.top = '100%';
        suggestionsContainer.style.left = '0';
        suggestionsContainer.style.right = '0';
        suggestionsContainer.style.backgroundColor = 'white';
        suggestionsContainer.style.border = '1px solid #ccc';
        suggestionsContainer.style.borderRadius = '4px';
        suggestionsContainer.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        suggestionsContainer.style.zIndex = '1000';
        suggestionsContainer.style.maxHeight = '200px';
        suggestionsContainer.style.overflowY = 'auto';
        
        console.log('Suggestions displayed:', suggestions.length, 'items');
    }

    hideSuggestions() {
        const suggestionsContainer = document.getElementById('locationSuggestions');
        if (suggestionsContainer) {
            suggestionsContainer.classList.add('hidden');
            suggestionsContainer.style.display = 'none';
        }
    }

    addLocation(locationName) {
        const trimmedLocation = locationName.trim();
        
        if (!trimmedLocation) return;
        
        // Check if location already exists
        if (this.selectedLocations.some(loc => loc.name === trimmedLocation)) {
            this.showError('Location already added');
            return;
        }
        
        this.selectedLocations.push({
            name: trimmedLocation,
            id: Date.now() + Math.random()
        });
        
        this.updateSelectedLocationsDisplay();
        document.getElementById('locationInput').value = '';
        this.hideSuggestions();
        this.clearError();
    }

    removeLocation(locationId) {
        this.selectedLocations = this.selectedLocations.filter(loc => loc.id !== locationId);
        this.updateSelectedLocationsDisplay();
    }

    updateSelectedLocationsDisplay() {
        const container = document.getElementById('selectedLocations');
        
        if (this.selectedLocations.length === 0) {
            container.innerHTML = '<div style="color: #666; font-style: italic; padding: 8px;">No locations selected. Start typing to add locations.</div>';
            return;
        }
        
        container.innerHTML = this.selectedLocations.map(location => `
            <div class="location-tag">
                <span>${location.name}</span>
                <button class="remove-btn" onclick="businessFinder.removeLocation(${location.id})">×</button>
            </div>
        `).join('');
    }

    // Tab functionality
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        // Update tab panels
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `${tabName}Tab`);
        });
        
        if (tabName === 'history') {
            this.renderHistory();
        }
    }

    toggleApiKeyVisibility() {
        const apiKeyInput = document.getElementById('apiKeyInput');
        const toggleBtn = document.getElementById('toggleApiKey');
        
        if (apiKeyInput.type === 'password') {
            apiKeyInput.type = 'text';
            toggleBtn.textContent = '🙈';
        } else {
            apiKeyInput.type = 'password';
            toggleBtn.textContent = '👁️';
        }
    }

    selectAllNiches() {
        const checkboxes = document.querySelectorAll('#nichesGrid input[type="checkbox"]');
        checkboxes.forEach(checkbox => checkbox.checked = true);
    }

    clearAllNiches() {
        const checkboxes = document.querySelectorAll('#nichesGrid input[type="checkbox"]');
        checkboxes.forEach(checkbox => checkbox.checked = false);
    }

    getSelectedNiches() {
        const checkboxes = document.querySelectorAll('#nichesGrid input[type="checkbox"]:checked');
        return Array.from(checkboxes).map(cb => {
            const niche = this.businessNiches.find(n => n.id === cb.value);
            return niche;
        });
    }

    async searchBusinesses() {
        const apiKey = document.getElementById('apiKeyInput').value.trim();
        const minResults = parseInt(document.getElementById('minResults').value);
        const maxResults = parseInt(document.getElementById('leadsCount').value);
        const selectedNiches = this.getSelectedNiches();
        
        // Validation
        if (!apiKey) {
            this.showError('Please enter your Google Places API key');
            return;
        }
        
        if (this.selectedLocations.length === 0) {
            this.showError('Please add at least one location');
            return;
        }
        
        if (selectedNiches.length === 0) {
            this.showError('Please select at least one business niche');
            return;
        }
        
        if (minResults < 1 || minResults > 1000) {
            this.showError('Minimum results must be between 1 and 1000');
            return;
        }
        
        if (maxResults < minResults || maxResults > 1000) {
            this.showError('Maximum results must be greater than minimum and not exceed 1000');
            return;
        }

        this.apiKey = apiKey;
        this.foundBusinesses = [];
        
        this.showLoading(true);
        this.clearResults();
        this.clearError();
        this.hideResultsHeader();

        try {
            // Search each location
            for (const location of this.selectedLocations) {
                // Get coordinates for the location
                const coordinates = await this.getCoordinates(location.name);
                
                // Search for businesses in each selected niche
                for (const niche of selectedNiches) {
                    if (this.foundBusinesses.length >= maxResults) break;
                    
                    await this.searchNiche(coordinates, niche, maxResults, location.name);
                    
                    // Small delay between niche searches
                    await new Promise(resolve => setTimeout(resolve, 200));
                }
                
                // Small delay between location searches
                await new Promise(resolve => setTimeout(resolve, 300));
            }
            
            // Filter businesses without websites
            const businessesWithoutWebsites = await this.filterBusinessesWithoutWebsites(
                this.foundBusinesses.slice(0, maxResults * 2)
            );
            
            // Check if we have minimum required results
            if (businessesWithoutWebsites.length < minResults) {
                this.showError(`Only found ${businessesWithoutWebsites.length} businesses, but you requested minimum ${minResults}. Try different locations or niches.`);
            }
            
            // Limit to requested maximum results
            const finalResults = businessesWithoutWebsites.slice(0, maxResults);
            
            // Store current search for saving
            this.currentSearch = {
                locations: this.selectedLocations.map(loc => loc.name),
                niches: selectedNiches.map(niche => niche.name),
                minResults: minResults,
                maxResults: maxResults,
                results: finalResults,
                timestamp: new Date().toISOString()
            };
            
            this.displayResults(finalResults);
        } catch (error) {
            console.error('Search error:', error);
            
            // More specific error messages
            if (error.message.includes('Location not found')) {
                this.showError('Location not found. Please check your location names and API key.');
            } else if (error.message.includes('CORS')) {
                this.showError('CORS error: Please run from a local server or enable CORS proxy. See README for setup instructions.');
            } else if (error.message.includes('API key')) {
                this.showError('Invalid API key. Please check your Google Places API key and ensure billing is enabled.');
            } else {
                this.showError(`Search failed: ${error.message}. Try running from a local server or check console for details.`);
            }
        } finally {
            this.showLoading(false);
        }
    }

    async searchNiche(coordinates, niche, maxResults, locationName) {
        for (const keyword of niche.keywords) {
            if (this.foundBusinesses.length >= maxResults * this.selectedLocations.length * 2) break;
            
            try {
                const businesses = await this.findBusinesses(coordinates, keyword);
                
                // Add unique businesses
                businesses.forEach(business => {
                    if (!this.foundBusinesses.find(b => b.place_id === business.place_id)) {
                        this.foundBusinesses.push({
                            ...business,
                            niche: niche.name,
                            searchLocation: locationName
                        });
                    }
                });
                
                // Small delay between keyword searches
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                console.error(`Error searching for ${keyword}:`, error);
            }
        }
    }

    async getCoordinates(location) {
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${this.apiKey}`;
        
        // Try multiple CORS proxies
        const proxies = [
            'https://cors-anywhere.herokuapp.com/',
            'https://api.allorigins.win/raw?url=',
            'https://corsproxy.io/?',
            '' // Direct request as fallback
        ];
        
        for (const proxy of proxies) {
            try {
                const response = await fetch(`${proxy}${geocodeUrl}`);
                const data = await response.json();
                
                if (data.status === 'OK' && data.results.length) {
                    return data.results[0].geometry.location;
                }
            } catch (error) {
                console.warn(`Geocoding proxy ${proxy} failed:`, error);
                continue;
            }
        }
        
        throw new Error(`Location not found: ${location}`);
    }

    async findBusinesses(coordinates, keyword) {
        const searchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coordinates.lat},${coordinates.lng}&radius=10000&type=establishment&keyword=${keyword}&key=${this.apiKey}`;
        
        // Try multiple CORS proxies
        const proxies = [
            'https://cors-anywhere.herokuapp.com/',
            'https://api.allorigins.win/raw?url=',
            'https://corsproxy.io/?',
            '' // Direct request as fallback
        ];
        
        for (const proxy of proxies) {
            try {
                const response = await fetch(`${proxy}${searchUrl}`);
                const data = await response.json();
                
                if (data.status === 'OK') {
                    return data.results || [];
                } else if (data.status === 'ZERO_RESULTS') {
                    return [];
                }
            } catch (error) {
                console.warn(`Search proxy ${proxy} failed:`, error);
                continue;
            }
        }
        
        console.error(`All proxies failed for keyword: ${keyword}`);
        return [];
    }

    async filterBusinessesWithoutWebsites(businesses) {
        const businessesWithoutWebsites = [];
        
        // Process businesses in batches to avoid rate limiting
        for (let i = 0; i < businesses.length; i += 5) {
            const batch = businesses.slice(i, i + 5);
            const batchPromises = batch.map(business => this.getBusinessDetails(business.place_id));
            
            try {
                const detailedBusinesses = await Promise.all(batchPromises);
                
                detailedBusinesses.forEach((business, index) => {
                    if (business && !business.website) {
                        businessesWithoutWebsites.push({
                            ...business,
                            niche: batch[index].niche,
                            searchLocation: batch[index].searchLocation
                        });
                    }
                });
                
                // Small delay between batches
                if (i + 5 < businesses.length) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            } catch (error) {
                console.error('Error processing batch:', error);
            }
        }
        
        return businessesWithoutWebsites;
    }

    async getBusinessDetails(placeId) {
        // Request comprehensive business details including social media and owner info
        const fields = [
            'name',
            'formatted_address',
            'address_components',
            'formatted_phone_number',
            'international_phone_number',
            'rating',
            'user_ratings_total',
            'website',
            'types',
            'business_status',
            'opening_hours',
            'reviews',
            'photos',
            'url',
            'utc_offset',
            'vicinity',
            'place_id'
        ].join(',');
        
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${this.apiKey}`;
        
        // Try multiple CORS proxies
        const proxies = [
            'https://cors-anywhere.herokuapp.com/',
            'https://api.allorigins.win/raw?url=',
            'https://corsproxy.io/?',
            '' // Direct request as fallback
        ];
        
        for (const proxy of proxies) {
            try {
                const response = await fetch(`${proxy}${detailsUrl}`);
                const data = await response.json();
                
                if (data.status === 'OK') {
                    // Enhance the result with additional social media search
                    const enhancedResult = await this.enhanceBusinessData(data.result);
                    return enhancedResult;
                }
            } catch (error) {
                console.warn(`Details proxy ${proxy} failed:`, error);
                continue;
            }
        }
        
        return null;
    }

    async enhanceBusinessData(business) {
        // Try to find social media and owner information
        const socialMedia = await this.findSocialMedia(business.name, business.formatted_address);
        // Extract detailed address components
        const addressDetails = this.parseAddressComponents(business.address_components);
        // Get owner/manager info from reviews if available
        const ownerInfo = this.extractOwnerInfo(business.reviews);
        // Extract email from reviews or description
        const email = this.extractEmailFromBusiness(business);
        // Determine best contact method
        const bestContact = this.getBestContactMethod(business, email);
        return {
            ...business,
            socialMedia,
            addressDetails,
            ownerInfo,
            email,
            bestContact,
            fullAddress: this.formatFullAddress(business.address_components),
            businessHours: business.opening_hours?.weekday_text || []
        };
    }

    extractEmailFromBusiness(business) {
        // Try to extract email from reviews or description
        let text = '';
        if (business.reviews) {
            text += business.reviews.map(r => r.text).join(' ');
        }
        if (business.description) {
            text += ' ' + business.description;
        }
        // Simple email regex
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const matches = text.match(emailRegex);
        return matches ? matches[0] : '';
    }

    getBestContactMethod(business, email) {
        // Scan reviews for contact method hints
        let reviewText = '';
        if (business.reviews) {
            reviewText = business.reviews.map(r => r.text.toLowerCase()).join(' ');
        }
        // Keywords
        const smsKeywords = ['text us', 'sms', 'text message', 'send a text', 'text to', 'txt us'];
        const emailKeywords = ['email us', 'send us an email', 'email:', 'e-mail', 'contact us by email'];
        // Prefer SMS if reviews mention texting/SMS
        if (smsKeywords.some(k => reviewText.includes(k))) {
            return 'SMS';
        }
        // Prefer Email if reviews mention email
        if (emailKeywords.some(k => reviewText.includes(k))) {
            return 'Email';
        }
        // Fallback: SMS if phone exists, else Email if email exists, else N/A
        if (business.formatted_phone_number || business.international_phone_number) {
            return 'SMS';
        } else if (email) {
            return 'Email';
        } else {
            return 'N/A';
        }
    }

    async findSocialMedia(businessName, address) {
        const socialMedia = {
            facebook: null,
            instagram: null,
            twitter: null,
            linkedin: null,
            youtube: null,
            tiktok: null
        };

        try {
            // Extract city for better targeting
            const city = this.extractCityFromAddress(address);
            
            // Use multiple search strategies to find actual social media profiles
            const searchStrategies = [
                this.searchSocialMediaDirect(businessName),
                this.searchSocialMediaWithLocation(businessName, city),
                this.searchSocialMediaVariations(businessName),
                this.searchSocialMediaByIndustry(businessName, address)
            ];

            const results = await Promise.allSettled(searchStrategies);
            
            // Combine results from all strategies
            results.forEach(result => {
                if (result.status === 'fulfilled' && result.value) {
                    Object.keys(result.value).forEach(platform => {
                        if (result.value[platform] && !socialMedia[platform]) {
                            socialMedia[platform] = result.value[platform];
                        }
                    });
                }
            });

            // Validate found profiles
            for (const platform in socialMedia) {
                if (socialMedia[platform]) {
                    const isValid = await this.validateSocialMediaProfile(socialMedia[platform], businessName);
                    if (!isValid) {
                        socialMedia[platform] = null;
                    }
                }
            }

        } catch (error) {
            console.warn('Social media search failed:', error);
        }

        return socialMedia;
    }

    async searchSocialMediaDirect(businessName) {
        const results = {};
        const cleanName = businessName.replace(/[^\w\s]/g, '').trim();
        
        // Facebook search patterns
        const facebookPatterns = [
            `${cleanName.replace(/\s+/g, '')}`,
            `${cleanName.replace(/\s+/g, '.')}`,
            `${cleanName.replace(/\s+/g, '-')}`,
            `${cleanName.toLowerCase().replace(/\s+/g, '')}`
        ];

        // Instagram search patterns  
        const instagramPatterns = [
            `${cleanName.replace(/\s+/g, '')}`,
            `${cleanName.replace(/\s+/g, '.')}`,
            `${cleanName.replace(/\s+/g, '_')}`,
            `${cleanName.toLowerCase().replace(/\s+/g, '')}`
        ];

        try {
            // Try to find actual profiles by testing common username patterns
            for (const pattern of facebookPatterns.slice(0, 2)) {
                const fbUrl = `https://www.facebook.com/${pattern}`;
                if (await this.checkUrlExists(fbUrl)) {
                    results.facebook = fbUrl;
                    break;
                }
            }

            for (const pattern of instagramPatterns.slice(0, 2)) {
                const igUrl = `https://www.instagram.com/${pattern}`;
                if (await this.checkUrlExists(igUrl)) {
                    results.instagram = igUrl;
                    break;
                }
            }

            // Twitter/X search
            const twitterPattern = cleanName.replace(/\s+/g, '').toLowerCase();
            const twitterUrl = `https://twitter.com/${twitterPattern}`;
            if (await this.checkUrlExists(twitterUrl)) {
                results.twitter = twitterUrl;
            }

        } catch (error) {
            console.warn('Direct social media search failed:', error);
        }

        return results;
    }

    async searchSocialMediaWithLocation(businessName, address) {
        const results = {};
        
        try {
            // Extract city from address for location-based search
            const city = this.extractCityFromAddress(address);
            const searchTerms = [
                `${businessName} ${city}`,
                `${businessName}`,
                businessName.split(' ')[0] // First word of business name
            ];

            // Use Google Custom Search API or similar service to find social media mentions
            // This is a placeholder for actual implementation
            const socialMentions = await this.searchForSocialMentions(searchTerms);
            
            // Parse results to extract actual social media URLs
            if (socialMentions) {
                results.facebook = this.extractFacebookUrl(socialMentions);
                results.instagram = this.extractInstagramUrl(socialMentions);
                results.twitter = this.extractTwitterUrl(socialMentions);
                results.linkedin = this.extractLinkedInUrl(socialMentions);
                results.youtube = this.extractYouTubeUrl(socialMentions);
            }

        } catch (error) {
            console.warn('Location-based social media search failed:', error);
        }

        return results;
    }

    async searchSocialMediaVariations(businessName) {
        const results = {};
        
        try {
            // Create variations of the business name
            const variations = [
                businessName,
                businessName.replace(/\b(LLC|Inc|Corp|Co|Ltd)\b/gi, '').trim(),
                businessName.replace(/\b(The|A|An)\b/gi, '').trim(),
                businessName.split(' ').slice(0, 2).join(' '), // First two words
                businessName.split(' ')[0] // First word only
            ];

            for (const variation of variations) {
                if (variation.length < 3) continue;
                
                const cleanVariation = variation.replace(/[^\w\s]/g, '').trim();
                
                // Try different social media username formats
                const formats = [
                    cleanVariation.replace(/\s+/g, '').toLowerCase(),
                    cleanVariation.replace(/\s+/g, '.').toLowerCase(),
                    cleanVariation.replace(/\s+/g, '_').toLowerCase(),
                    cleanVariation.replace(/\s+/g, '-').toLowerCase()
                ];

                for (const format of formats.slice(0, 2)) {
                    if (!results.facebook) {
                        const fbUrl = `https://www.facebook.com/${format}`;
                        if (await this.checkUrlExists(fbUrl)) {
                            results.facebook = fbUrl;
                        }
                    }

                    if (!results.instagram) {
                        const igUrl = `https://www.instagram.com/${format}`;
                        if (await this.checkUrlExists(igUrl)) {
                            results.instagram = igUrl;
                        }
                    }
                }

                if (results.facebook && results.instagram) break;
            }

        } catch (error) {
            console.warn('Variation-based social media search failed:', error);
        }

        return results;
    }

    async checkUrlExists(url) {
        try {
            // Use a CORS proxy to check if URL exists
            const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
            const response = await fetch(`${proxyUrl}${url}`, { 
                method: 'HEAD',
                timeout: 3000 
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    extractCityFromAddress(address) {
        if (!address) return '';
        
        // Simple city extraction - you might want to enhance this
        const parts = address.split(',');
        if (parts.length >= 2) {
            return parts[parts.length - 2].trim();
        }
        return '';
    }

    async searchForSocialMentions(searchTerms) {
        // Placeholder for actual search implementation
        // You would implement this using:
        // - Google Custom Search API
        // - Bing Search API
        // - Social media APIs
        // - Web scraping services
        
        try {
            // This is where you'd make actual API calls to search engines
            // to find social media mentions of the business
            
            // For now, return null to indicate no results found
            return null;
            
        } catch (error) {
            console.warn('Social mentions search failed:', error);
            return null;
        }
    }

    extractFacebookUrl(searchResults) {
        if (!searchResults) return null;
        
        const fbRegex = /https?:\/\/(www\.)?facebook\.com\/[a-zA-Z0-9._-]+/g;
        const matches = searchResults.match(fbRegex);
        return matches ? matches[0] : null;
    }

    extractInstagramUrl(searchResults) {
        if (!searchResults) return null;
        
        const igRegex = /https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._-]+/g;
        const matches = searchResults.match(igRegex);
        return matches ? matches[0] : null;
    }

    extractTwitterUrl(searchResults) {
        if (!searchResults) return null;
        
        const twitterRegex = /https?:\/\/(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9._-]+/g;
        const matches = searchResults.match(twitterRegex);
        return matches ? matches[0] : null;
    }

    extractLinkedInUrl(searchResults) {
        if (!searchResults) return null;
        
        const linkedinRegex = /https?:\/\/(www\.)?linkedin\.com\/(company|in)\/[a-zA-Z0-9._-]+/g;
        const matches = searchResults.match(linkedinRegex);
        return matches ? matches[0] : null;
    }

    extractYouTubeUrl(searchResults) {
        if (!searchResults) return null;
        
        const youtubeRegex = /https?:\/\/(www\.)?(youtube\.com\/(channel|c|user)\/[a-zA-Z0-9._-]+|youtu\.be\/[a-zA-Z0-9._-]+)/g;
        const matches = searchResults.match(youtubeRegex);
        return matches ? matches[0] : null;
    }

    parseAddressComponents(components) {
        if (!components) return {};
        
        const addressDetails = {};
        
        components.forEach(component => {
            const types = component.types;
            
            if (types.includes('street_number')) {
                addressDetails.streetNumber = component.long_name;
            } else if (types.includes('route')) {
                addressDetails.streetName = component.long_name;
            } else if (types.includes('locality')) {
                addressDetails.city = component.long_name;
            } else if (types.includes('administrative_area_level_1')) {
                addressDetails.state = component.long_name;
                addressDetails.stateCode = component.short_name;
            } else if (types.includes('postal_code')) {
                addressDetails.zipCode = component.long_name;
            } else if (types.includes('country')) {
                addressDetails.country = component.long_name;
                addressDetails.countryCode = component.short_name;
            } else if (types.includes('sublocality') || types.includes('neighborhood')) {
                addressDetails.neighborhood = component.long_name;
            }
        });
        
        return addressDetails;
    }

    formatFullAddress(components) {
        if (!components) return '';
        
        const details = this.parseAddressComponents(components);
        
        let fullAddress = '';
        if (details.streetNumber && details.streetName) {
            fullAddress += `${details.streetNumber} ${details.streetName}`;
        }
        if (details.neighborhood) {
            fullAddress += fullAddress ? `, ${details.neighborhood}` : details.neighborhood;
        }
        if (details.city) {
            fullAddress += fullAddress ? `, ${details.city}` : details.city;
        }
        if (details.state) {
            fullAddress += fullAddress ? `, ${details.stateCode || details.state}` : (details.stateCode || details.state);
        }
        if (details.zipCode) {
            fullAddress += ` ${details.zipCode}`;
        }
        if (details.country && details.countryCode !== 'US') {
            fullAddress += `, ${details.country}`;
        }
        
        return fullAddress;
    }

    extractOwnerInfo(reviews) {
        if (!reviews || reviews.length === 0) return null;
        
        const potentialOwners = [];
        
        // Enhanced owner detection patterns
        const ownerPatterns = [
            { pattern: /owner/i, title: 'Owner', confidence: 10 },
            { pattern: /manager/i, title: 'Manager', confidence: 8 },
            { pattern: /proprietor/i, title: 'Proprietor', confidence: 9 },
            { pattern: /founder/i, title: 'Founder', confidence: 9 },
            { pattern: /ceo/i, title: 'CEO', confidence: 8 },
            { pattern: /president/i, title: 'President', confidence: 7 },
            { pattern: /director/i, title: 'Director', confidence: 6 },
            { pattern: /principal/i, title: 'Principal', confidence: 7 },
            { pattern: /chef/i, title: 'Chef/Owner', confidence: 8 }
        ];

        const ownerResponsePatterns = [
            { pattern: /owner here/i, confidence: 10 },
            { pattern: /i am the owner/i, confidence: 10 },
            { pattern: /i'm the owner/i, confidence: 10 },
            { pattern: /as the owner/i, confidence: 9 },
            { pattern: /owner of this/i, confidence: 9 },
            { pattern: /my business/i, confidence: 7 },
            { pattern: /our establishment/i, confidence: 6 },
            { pattern: /we appreciate/i, confidence: 5 },
            { pattern: /thank you for/i, confidence: 4 },
            { pattern: /response from.*owner/i, confidence: 8 },
            { pattern: /management response/i, confidence: 6 },
            { pattern: /from the management/i, confidence: 6 }
        ];

        // Analyze each review for owner information
        reviews.forEach((review, index) => {
            let confidence = 0;
            let title = 'Owner';
            let source = 'review_author';
            
            // Check author name for owner indicators
            if (review.author_name) {
                ownerPatterns.forEach(({ pattern, title: patternTitle, confidence: patternConfidence }) => {
                    if (pattern.test(review.author_name)) {
                        confidence += patternConfidence;
                        title = patternTitle;
                    }
                });
            }
            
            // Check review text for owner responses
            if (review.text) {
                ownerResponsePatterns.forEach(({ pattern, confidence: patternConfidence }) => {
                    if (pattern.test(review.text)) {
                        confidence += patternConfidence;
                        source = 'review_response';
                    }
                });
                
                // Additional context clues
                if (review.text.toLowerCase().includes('thank you') && 
                    review.text.toLowerCase().includes('visit')) {
                    confidence += 3;
                }
                
                if (review.text.toLowerCase().includes('sorry') && 
                    review.text.toLowerCase().includes('experience')) {
                    confidence += 4;
                }
            }
            
            // Higher confidence for verified business responses
            if (review.author_name && review.author_name.includes('Business')) {
                confidence += 5;
                source = 'business_response';
            }
            
            if (confidence > 5) {
                potentialOwners.push({
                    name: review.author_name,
                    title: title,
                    response: review.text ? review.text.substring(0, 200) + '...' : null,
                    profilePhoto: review.profile_photo_url,
                    confidence: confidence,
                    source: source,
                    reviewDate: review.time,
                    rating: review.rating
                });
            }
        });
        
        // Sort by confidence and return the best match
        if (potentialOwners.length > 0) {
            potentialOwners.sort((a, b) => b.confidence - a.confidence);
            const bestMatch = potentialOwners[0];
            
            // Additional validation
            if (bestMatch.confidence >= 8) {
                return {
                    name: bestMatch.name,
                    title: bestMatch.title,
                    response: bestMatch.response,
                    profilePhoto: bestMatch.profilePhoto,
                    confidence: bestMatch.confidence,
                    source: bestMatch.source,
                    alternativeOwners: potentialOwners.slice(1, 3) // Include up to 2 alternatives
                };
            }
        }
        
        return null;
            
            if (!review.author_name || !review.text) return;
            
            const authorName = review.author_name.toLowerCase();
            const reviewText = review.text.toLowerCase();
            
            // Check author name for owner indicators
            ownerPatterns.forEach(pattern => {
                if (pattern.test(authorName)) {
                    confidence += 30;
                    if (pattern.source === /manager/i) title = 'Manager';
                    if (pattern.source === /founder/i) title = 'Founder';
                    if (pattern.source === /ceo/i) title = 'CEO';
                }
            });
            
            // Check review text for owner responses
            ownerResponsePatterns.forEach(pattern => {
                if (pattern.test(reviewText)) {
                    confidence += 25;
                }
            });
            
            // Additional confidence boosters
            if (reviewText.includes('thank you') && reviewText.includes('business')) confidence += 15;
            if (reviewText.includes('appreciate') && reviewText.includes('feedback')) confidence += 15;
            if (reviewText.includes('we will') || reviewText.includes('we are')) confidence += 10;
            if (review.text.length > 100) confidence += 5; // Longer responses more likely from owner
            
            // Check if this looks like a business response
            if (this.isBusinessResponse(review.text)) {
                confidence += 20;
            }
            
            if (confidence > 20) {
                potentialOwners.push({
                    name: review.author_name,
                    title: title,
                    response: review.text,
                    profilePhoto: review.profile_photo_url,
                    confidence: confidence,
                    source: 'Google Reviews'
                });
            }
        });

        // Sort by confidence and return the most likely owner
        if (potentialOwners.length > 0) {
            const bestMatch = potentialOwners.sort((a, b) => b.confidence - a.confidence)[0];
            
            return {
                name: bestMatch.name,
                title: bestMatch.title,
                response: this.truncateText(bestMatch.response, 200),
                profilePhoto: bestMatch.profilePhoto,
                confidence: bestMatch.confidence,
                source: bestMatch.source,
                allCandidates: potentialOwners.length
            };
        }
        
        // If no owner found in reviews, try to extract from business name patterns
        return this.extractOwnerFromBusinessName(reviews[0]?.author_name);
    }

    isBusinessResponse(text) {
        const businessResponseIndicators = [
            /thank you for/i,
            /we appreciate/i,
            /sorry to hear/i,
            /glad you enjoyed/i,
            /please contact us/i,
            /we strive/i,
            /our team/i,
            /we look forward/i,
            /management/i,
            /staff/i
        ];

        return businessResponseIndicators.some(pattern => pattern.test(text));
    }

    extractOwnerFromBusinessName(businessName) {
        if (!businessName) return null;
        
        // Look for personal names in business names (e.g., "John's Pizza", "Smith & Associates")
        const personalNamePatterns = [
            /([A-Z][a-z]+)'s/,  // John's, Mary's
            /([A-Z][a-z]+) & ([A-Z][a-z]+)/, // Smith & Jones
            /([A-Z][a-z]+) ([A-Z][a-z]+) (LLC|Inc|Corp)/i, // John Smith LLC
        ];

        for (const pattern of personalNamePatterns) {
            const match = businessName.match(pattern);
            if (match) {
                return {
                    name: match[1] + (match[2] ? ` & ${match[2]}` : ''),
                    title: 'Owner',
                    response: null,
                    profilePhoto: null,
                    confidence: 15,
                    source: 'Business Name Analysis',
                    allCandidates: 1
                };
            }
        }
        
        return null;
    }

    truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    displayResults(businesses) {
        const resultsContainer = document.getElementById('results');
        
        this.foundBusinesses = businesses; // Store for export
        
        if (businesses.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results" style="text-align: center; padding: 40px; color: #6c757d;">
                    <h3>No businesses without websites found</h3>
                    <p>Try searching with different business types or locations.</p>
                </div>
            `;
            this.hideResultsHeader();
            return;
        }

        this.showResultsHeader();
        
        const tableHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Business Type</th>
                        <th>Address</th>
                        <th>Phone</th>
                    </tr>
                </thead>
                <tbody>
                    ${businesses.map(business => this.createTableRow(business)).join('')}
                </tbody>
            </table>
        `;
        
        resultsContainer.innerHTML = tableHTML;
    }

    createTableRow(business) {
        const name = business.name || 'N/A';
        const address = business.formatted_address || 'N/A';
        const phone = business.formatted_phone_number || business.international_phone_number || 'N/A';
        const types = business.types || [];
        
        // Get the most relevant business type
        const businessType = types
            .filter(type => !['establishment', 'point_of_interest'].includes(type))
            .map(type => type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))
            .slice(0, 1)[0] || 'Business';

        return `
            <tr>
                <td><strong>${name}</strong></td>
                <td>${businessType}</td>
                <td>${address}</td>
                <td>${phone}</td>
            </tr>
        `;
    }

    showResultsHeader() {
        document.getElementById('resultsHeader').classList.remove('hidden');
    }

    hideResultsHeader() {
        document.getElementById('resultsHeader').classList.add('hidden');
    }

    createBusinessCard(business, index) {
        const rating = business.rating || 0;
        const reviewCount = business.user_ratings_total || 0;
        const phone = business.formatted_phone_number || business.international_phone_number || 'Phone not available';
        const types = business.types || [];
        const searchLocation = business.searchLocation || 'Unknown';
        const niche = business.niche || 'General';
        const addressDetails = business.addressDetails || {};
        const ownerInfo = business.ownerInfo;
        const socialMedia = business.socialMedia || {};
        const businessHours = business.businessHours || [];
        
        // Filter out generic types and format them nicely
        const relevantTypes = types
            .filter(type => !['establishment', 'point_of_interest'].includes(type))
            .slice(0, 3)
            .map(type => type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));

        // Format full address with components
        const fullAddress = business.fullAddress || business.formatted_address;
        
        // Create social media links section
        const socialMediaLinks = this.createSocialMediaSection(socialMedia, business.name);
        
        // Create owner information section
        const ownerSection = ownerInfo ? `
            <div class="owner-info">
                <div class="owner-label">👤 ${ownerInfo.title || 'Owner/Manager'}:</div>
                <div class="owner-details">
                    ${ownerInfo.profilePhoto ? `<img src="${ownerInfo.profilePhoto}" alt="Owner" class="owner-photo">` : ''}
                    <div class="owner-main">
                        <div class="owner-name">${ownerInfo.name}</div>
                        <div class="owner-meta">
                            <span class="owner-confidence">Confidence: ${ownerInfo.confidence}%</span>
                            <span class="owner-source">Source: ${ownerInfo.source}</span>
                            ${ownerInfo.allCandidates > 1 ? `<span class="owner-candidates">${ownerInfo.allCandidates} candidates found</span>` : ''}
                        </div>
                        ${ownerInfo.response ? `<div class="owner-response">"${ownerInfo.response}"</div>` : ''}
                    </div>
                </div>
            </div>
        ` : `
            <div class="owner-info no-owner">
                <div class="owner-label">👤 Owner Information:</div>
                <div class="no-owner-found">
                    <span>No owner information found in reviews</span>
                    <div class="owner-search-tips">
                        <small>💡 Try checking social media profiles or business website for owner details</small>
                    </div>
                </div>
            </div>
        `;

        // Create detailed address section
        const addressSection = `
            <div class="address-details">
                <div class="address-label">📍 Full Address:</div>
                <div class="full-address">${fullAddress}</div>
                ${addressDetails.neighborhood ? `<div class="neighborhood">Neighborhood: ${addressDetails.neighborhood}</div>` : ''}
                ${addressDetails.zipCode ? `<div class="zip-code">ZIP: ${addressDetails.zipCode}</div>` : ''}
            </div>
        `;

        // Create business hours section
        const hoursSection = businessHours.length > 0 ? `
            <div class="business-hours">
                <div class="hours-label">🕒 Hours:</div>
                <div class="hours-list">
                    ${businessHours.slice(0, 3).map(hour => `<div class="hour-item">${hour}</div>`).join('')}
                    ${businessHours.length > 3 ? `<div class="hours-more">+${businessHours.length - 3} more days</div>` : ''}
                </div>
            </div>
        ` : '';

        return `
            <div class="business-card">
                <div class="business-header">
                    <div class="business-number">#${index}</div>
                    <div class="business-name">${business.name}</div>
                </div>
                
                ${addressSection}
                
                <div class="business-meta">
                    <span class="search-location">📍 Found in: ${searchLocation}</span>
                    <span class="business-niche">🏷️ Category: ${niche}</span>
                </div>
                
                ${rating > 0 ? `
                    <div class="business-rating">
                        <span class="stars">${this.generateStars(rating)}</span>
                        <span class="rating-text">${rating.toFixed(1)} (${reviewCount} reviews)</span>
                    </div>
                ` : ''}
                
                <div class="contact-info">
                    <div class="business-phone">📞 ${phone}</div>
                    ${business.international_phone_number && business.international_phone_number !== phone ? 
                        `<div class="international-phone">🌍 ${business.international_phone_number}</div>` : ''}
                </div>
                
                ${ownerSection}
                
                ${socialMediaLinks}
                
                ${hoursSection}
                
                ${relevantTypes.length > 0 ? `
                    <div class="business-types">
                        ${relevantTypes.map(type => `<span class="type-tag">${type}</span>`).join('')}
                    </div>
                ` : ''}
                
                <div class="business-footer">
                    <div class="no-website-badge">No Website Listed</div>
                    ${business.url ? `<a href="${business.url}" target="_blank" class="google-link">View on Google Maps</a>` : ''}
                </div>
            </div>
        `;
    }

    createSocialMediaSection(socialMedia, businessName) {
        if (!socialMedia) return '';
        
        const platforms = [
            { key: 'facebook', name: 'Facebook', icon: '📘', searchUrl: `https://www.facebook.com/search/top?q=${encodeURIComponent(businessName)}` },
            { key: 'instagram', name: 'Instagram', icon: '📷', searchUrl: `https://www.instagram.com/explore/tags/${encodeURIComponent(businessName.replace(/\s+/g, ''))}` },
            { key: 'twitter', name: 'Twitter', icon: '🐦', searchUrl: `https://twitter.com/search?q=${encodeURIComponent(businessName)}` },
            { key: 'linkedin', name: 'LinkedIn', icon: '💼', searchUrl: `https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(businessName)}` },
            { key: 'youtube', name: 'YouTube', icon: '📺', searchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(businessName)}` },
            { key: 'tiktok', name: 'TikTok', icon: '🎵', searchUrl: `https://www.tiktok.com/search?q=${encodeURIComponent(businessName)}` }
        ];

        const foundProfiles = [];
        const searchLinks = [];

        platforms.forEach(platform => {
            const actualProfile = socialMedia[platform.key];
            if (actualProfile) {
                foundProfiles.push(`<a href="${actualProfile}" target="_blank" class="social-link verified">
                    ${platform.icon} ${platform.name} ✓
                </a>`);
            } else {
                searchLinks.push(`<a href="${platform.searchUrl}" target="_blank" class="social-link search">
                    ${platform.icon} Search ${platform.name}
                </a>`);
            }
        });

        let socialContent = '';
        
        if (foundProfiles.length > 0) {
            socialContent += `
                <div class="social-found">
                    <div class="social-found-label">✅ Found Profiles:</div>
                    <div class="social-links">
                        ${foundProfiles.join('')}
                    </div>
                </div>
            `;
        }
        
        if (searchLinks.length > 0) {
            socialContent += `
                <div class="social-search">
                    <div class="social-search-label">🔍 Search for Profiles:</div>
                    <div class="social-links">
                        ${searchLinks.join('')}
                    </div>
                </div>
            `;
        }

        return socialContent ? `
            <div class="social-media">
                <div class="social-label">🔗 Social Media:</div>
                ${socialContent}
            </div>
        ` : '';
    }

    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let stars = '';
        
        for (let i = 0; i < fullStars; i++) {
            stars += '★';
        }
        
        if (hasHalfStar) {
            stars += '☆';
        }
        
        return stars;
    }

    // History functionality
    saveCurrentSearch() {
        if (!this.currentSearch) {
            this.showError('No search results to save');
            return;
        }
        
        const searchId = Date.now();
        const searchToSave = {
            ...this.currentSearch,
            id: searchId,
            savedAt: new Date().toISOString()
        };
        
        this.searchHistory.unshift(searchToSave);
        
        // Keep only last 50 searches
        if (this.searchHistory.length > 50) {
            this.searchHistory = this.searchHistory.slice(0, 50);
        }
        
        this.saveSearchHistory();
        this.renderHistory();
        
        // Show success message
        const originalText = document.getElementById('saveSearch').textContent;
        document.getElementById('saveSearch').textContent = 'Saved!';
        setTimeout(() => {
            document.getElementById('saveSearch').textContent = originalText;
        }, 2000);
    }

    loadSearchHistory() {
        try {
            const history = localStorage.getItem('businessFinderHistory');
            return history ? JSON.parse(history) : [];
        } catch (error) {
            console.error('Error loading search history:', error);
            return [];
        }
    }

    saveSearchHistory() {
        try {
            localStorage.setItem('businessFinderHistory', JSON.stringify(this.searchHistory));
        } catch (error) {
            console.error('Error saving search history:', error);
        }
    }

    renderHistory() {
        const historyList = document.getElementById('historyList');
        
        if (this.searchHistory.length === 0) {
            historyList.innerHTML = `
                <div style="text-align: center; color: #666; padding: 40px;">
                    <h4>No search history yet</h4>
                    <p>Your saved searches will appear here</p>
                </div>
            `;
            return;
        }
        
        historyList.innerHTML = this.searchHistory.map(search => `
            <div class="history-item">
                <div class="history-item-header">
                    <div class="history-date">${new Date(search.savedAt).toLocaleString()}</div>
                    <div class="history-actions">
                        <button class="history-btn load-btn" onclick="businessFinder.loadSearch(${search.id})">Load</button>
                        <button class="history-btn delete-btn" onclick="businessFinder.deleteSearch(${search.id})">Delete</button>
                    </div>
                </div>
                <div class="history-details">
                    <div class="history-detail">
                        <div class="history-detail-label">Locations:</div>
                        <div class="history-locations">
                            ${search.locations.map(loc => `<span class="history-location-tag">${loc}</span>`).join('')}
                        </div>
                    </div>
                    <div class="history-detail">
                        <div class="history-detail-label">Niches:</div>
                        <div class="history-niches">
                            ${search.niches.slice(0, 5).map(niche => `<span class="history-niche-tag">${niche}</span>`).join('')}
                            ${search.niches.length > 5 ? `<span class="history-niche-tag">+${search.niches.length - 5} more</span>` : ''}
                        </div>
                    </div>
                    <div class="history-detail">
                        <div class="history-detail-label">Results Range:</div>
                        <div>${search.minResults || search.leadsCount || 'N/A'} - ${search.maxResults || search.leadsCount || 'N/A'}</div>
                    </div>
                    <div class="history-detail">
                        <div class="history-detail-label">Results Found:</div>
                        <div>${search.results.length} businesses</div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    loadSearch(searchId) {
        const search = this.searchHistory.find(s => s.id === searchId);
        if (!search) return;
        
        // Load locations
        this.selectedLocations = search.locations.map((name, index) => ({
            name: name,
            id: Date.now() + index
        }));
        this.updateSelectedLocationsDisplay();
        
        // Load results range
        if (search.minResults) {
            document.getElementById('minResults').value = search.minResults;
        }
        if (search.maxResults) {
            document.getElementById('leadsCount').value = search.maxResults;
        } else if (search.leadsCount) {
            document.getElementById('leadsCount').value = search.leadsCount;
        }
        
        // Load niches
        this.clearAllNiches();
        search.niches.forEach(nicheName => {
            const niche = this.businessNiches.find(n => n.name === nicheName);
            if (niche) {
                const checkbox = document.getElementById(`niche_${niche.id}`);
                if (checkbox) checkbox.checked = true;
            }
        });
        
        // Load results
        this.foundBusinesses = search.results;
        this.currentSearch = search;
        this.displayResults(search.results);
        
        // Switch to search tab
        this.switchTab('search');
    }

    deleteSearch(searchId) {
        if (confirm('Are you sure you want to delete this search?')) {
            this.searchHistory = this.searchHistory.filter(s => s.id !== searchId);
            this.saveSearchHistory();
            this.renderHistory();
        }
    }

    clearAllHistory() {
        if (confirm('Are you sure you want to clear all search history?')) {
            this.searchHistory = [];
            this.saveSearchHistory();
            this.renderHistory();
        }
    }

    showLoading(show) {
        const loading = document.getElementById('loading');
        loading.classList.toggle('hidden', !show);
    }

    showError(message) {
        const error = document.getElementById('error');
        error.textContent = message;
        error.classList.remove('hidden');
        
        // Auto-hide error after 5 seconds
        setTimeout(() => {
            this.clearError();
        }, 5000);
    }

    clearError() {
        const error = document.getElementById('error');
        error.classList.add('hidden');
    }

    clearResults() {
        const results = document.getElementById('results');
        results.innerHTML = '';
    }

    exportToCsv() {
        if (!this.foundBusinesses || this.foundBusinesses.length === 0) {
            this.showError('No data to export');
            return;
        }

        const headers = [
            'Number', 'Business Name', 'Full Address', 'Phone', 'International Phone', 
            'City', 'State', 'ZIP Code', 'Country', 'Neighborhood',
            'Rating', 'Reviews', 'Types', 'Niche', 'Search Location',
            'Owner Name', 'Owner Title', 'Owner Confidence', 'Owner Source',
            'Facebook Profile', 'Instagram Profile', 'Twitter Profile', 'LinkedIn Profile', 'YouTube Profile', 'TikTok Profile',
            'Facebook Search', 'Instagram Search', 'Twitter Search', 'LinkedIn Search', 'YouTube Search',
            'Google Maps URL', 'Business Hours'
        ];
        
        const csvContent = [
            headers.join(','),
            ...this.foundBusinesses.map((business, index) => {
                const types = (business.types || [])
                    .filter(type => !['establishment', 'point_of_interest'].includes(type))
                    .join('; ');
                
                const addressDetails = business.addressDetails || {};
                const ownerInfo = business.ownerInfo;
                const socialMedia = business.socialMedia || {};
                const businessName = business.name || '';
                
                // Create social media search URLs
                const facebookSearch = `https://www.facebook.com/search/top?q=${encodeURIComponent(businessName)}`;
                const instagramSearch = `https://www.instagram.com/explore/tags/${encodeURIComponent(businessName.replace(/\s+/g, ''))}`;
                const twitterSearch = `https://twitter.com/search?q=${encodeURIComponent(businessName)}`;
                const linkedinSearch = `https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(businessName)}`;
                const youtubeSearch = `https://www.youtube.com/results?search_query=${encodeURIComponent(businessName)}`;
                
                return [
                    index + 1,
                    `"${businessName}"`,
                    `"${business.fullAddress || business.formatted_address || ''}"`,
                    `"${business.formatted_phone_number || ''}"`,
                    `"${business.international_phone_number || ''}"`,
                    `"${addressDetails.city || ''}"`,
                    `"${addressDetails.state || ''}"`,
                    `"${addressDetails.zipCode || ''}"`,
                    `"${addressDetails.country || ''}"`,
                    `"${addressDetails.neighborhood || ''}"`,
                    business.rating || '',
                    business.user_ratings_total || '',
                    `"${types}"`,
                    `"${business.niche || ''}"`,
                    `"${business.searchLocation || ''}"`,
                    `"${ownerInfo ? ownerInfo.name : ''}"`,
                    `"${ownerInfo ? ownerInfo.title : ''}"`,
                    `"${ownerInfo ? ownerInfo.confidence + '%' : ''}"`,
                    `"${ownerInfo ? ownerInfo.source : ''}"`,
                    `"${socialMedia.facebook || ''}"`,
                    `"${socialMedia.instagram || ''}"`,
                    `"${socialMedia.twitter || ''}"`,
                    `"${socialMedia.linkedin || ''}"`,
                    `"${socialMedia.youtube || ''}"`,
                    `"${socialMedia.tiktok || ''}"`,
                    `"${facebookSearch}"`,
                    `"${instagramSearch}"`,
                    `"${twitterSearch}"`,
                    `"${linkedinSearch}"`,
                    `"${youtubeSearch}"`,
                    `"${business.url || ''}"`,
                    `"${(business.businessHours || []).join('; ')}"`
                ].join(',');
            })
        ].join('\n');

        this.downloadFile(csvContent, 'businesses-without-websites-detailed.csv', 'text/csv');
    }

    exportToJson() {
        if (!this.foundBusinesses || this.foundBusinesses.length === 0) {
            this.showError('No data to export');
            return;
        }

        const exportData = {
            exportDate: new Date().toISOString(),
            searchLocations: this.selectedLocations.map(loc => loc.name),
            totalResults: this.foundBusinesses.length,
            businesses: this.foundBusinesses.map((business, index) => ({
                number: index + 1,
                name: business.name,
                fullAddress: business.fullAddress || business.formatted_address,
                formattedAddress: business.formatted_address,
                addressDetails: business.addressDetails,
                phone: business.formatted_phone_number,
                internationalPhone: business.international_phone_number,
                rating: business.rating,
                reviewCount: business.user_ratings_total,
                types: business.types,
                niche: business.niche,
                searchLocation: business.searchLocation,
                ownerInfo: business.ownerInfo,
                socialMediaProfiles: business.socialMedia,
                socialMediaSearchUrls: {
                    facebook: `https://www.facebook.com/search/top?q=${encodeURIComponent(business.name || '')}`,
                    instagram: `https://www.instagram.com/explore/tags/${encodeURIComponent((business.name || '').replace(/\s+/g, ''))}`,
                    twitter: `https://twitter.com/search?q=${encodeURIComponent(business.name || '')}`,
                    linkedin: `https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(business.name || '')}`,
                    youtube: `https://www.youtube.com/results?search_query=${encodeURIComponent(business.name || '')}`,
                    tiktok: `https://www.tiktok.com/search?q=${encodeURIComponent(business.name || '')}`
                },
                businessHours: business.businessHours,
                googleMapsUrl: business.url,
                placeId: business.place_id,
                lastUpdated: new Date().toISOString()
            }))
        };

        const jsonContent = JSON.stringify(exportData, null, 2);
        this.downloadFile(jsonContent, 'businesses-without-websites-detailed.json', 'application/json');
    }

    downloadFile(content, filename, contentType) {
        const blob = new Blob([content], { type: contentType });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }

    // Test API connection
    async testApiConnection() {
        const apiKey = document.getElementById('apiKeyInput').value.trim();
        
        if (!apiKey) {
            this.showError('Please enter your API key first');
            return;
        }
        
        this.showLoading(true);
        this.clearError();
        
        try {
            // Test with a simple geocoding request
            const testUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=New+York&key=${apiKey}`;
            
            const proxies = [
                'https://cors-anywhere.herokuapp.com/',
                'https://api.allorigins.win/raw?url=',
                'https://corsproxy.io/?',
                ''
            ];
            
            let success = false;
            for (const proxy of proxies) {
                try {
                    const response = await fetch(`${proxy}${testUrl}`);
                    const data = await response.json();
                    
                    if (data.status === 'OK') {
                        this.showError(`✅ API connection successful using ${proxy || 'direct connection'}!`);
                        success = true;
                        break;
                    } else if (data.status === 'REQUEST_DENIED') {
                        this.showError('❌ API key invalid or APIs not enabled. Check Google Cloud Console.');
                        break;
                    }
                } catch (error) {
                    console.warn(`Test proxy ${proxy} failed:`, error);
                    continue;
                }
            }
            
            if (!success) {
                this.showError('❌ All connection methods failed. Try running from a local server.');
            }
            
        } catch (error) {
            this.showError(`❌ Connection test failed: ${error.message}`);
        } finally {
            this.showLoading(false);
        }
    }
}

// Initialize the app when the page loads
let businessFinder;

function initializeBusinessFinder() {
    try {
        console.log('Starting BusinessFinder initialization...');
        businessFinder = new BusinessFinder();
        console.log('BusinessFinder initialized successfully');
    } catch (error) {
        console.error('Error initializing BusinessFinder:', error);
        // Retry after a short delay
        setTimeout(initializeBusinessFinder, 500);
    }
}

document.addEventListener('DOMContentLoaded', initializeBusinessFinder);

// Direct location input handler (backup)
function handleLocationInputDirect(value) {
    console.log('Direct handler called with:', value);
    
    if (!value || value.length < 2) {
        hideLocationSuggestions();
        return;
    }
    
    const locations = [
        'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ',
        'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'San Jose, CA',
        'Austin, TX', 'Jacksonville, FL', 'Fort Worth, TX', 'Columbus, OH', 'Charlotte, NC',
        'San Francisco, CA', 'Indianapolis, IN', 'Seattle, WA', 'Denver, CO', 'Washington, DC',
        'Boston, MA', 'El Paso, TX', 'Nashville, TN', 'Detroit, MI', 'Oklahoma City, OK',
        'Portland, OR', 'Las Vegas, NV', 'Memphis, TN', 'Louisville, KY', 'Baltimore, MD',
        'Milwaukee, WI', 'Albuquerque, NM', 'Tucson, AZ', 'Fresno, CA', 'Sacramento, CA',
        'Mesa, AZ', 'Kansas City, MO', 'Atlanta, GA', 'Long Beach, CA', 'Colorado Springs, CO',
        'Raleigh, NC', 'Miami, FL', 'Virginia Beach, VA', 'Omaha, NE', 'Oakland, CA',
        'Minneapolis, MN', 'Tulsa, OK', 'Arlington, TX', 'Tampa, FL', 'New Orleans, LA'
    ];
    
    const filtered = locations.filter(loc => 
        loc.toLowerCase().includes(value.toLowerCase())
    ).slice(0, 5);
    
    console.log('Filtered suggestions:', filtered);
    showLocationSuggestionsDirect(filtered);
}

function showLocationSuggestionsDirect(suggestions) {
    const container = document.getElementById('locationSuggestions');
    if (!container) {
        console.error('Suggestions container not found');
        return;
    }
    
    if (suggestions.length === 0) {
        hideLocationSuggestions();
        return;
    }
    
    container.innerHTML = '';
    container.style.display = 'block';
    container.style.position = 'absolute';
    container.style.top = '100%';
    container.style.left = '0';
    container.style.right = '0';
    container.style.backgroundColor = 'white';
    container.style.border = '1px solid #ccc';
    container.style.borderRadius = '4px';
    container.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
    container.style.zIndex = '1000';
    container.style.maxHeight = '200px';
    container.style.overflowY = 'auto';
    container.classList.remove('hidden');
    
    suggestions.forEach(suggestion => {
        const item = document.createElement('div');
        item.textContent = suggestion;
        item.style.padding = '12px 16px';
        item.style.cursor = 'pointer';
        item.style.borderBottom = '1px solid #eee';
        item.style.transition = 'background-color 0.2s';
        
        item.onmouseenter = () => item.style.backgroundColor = '#f5f5f5';
        item.onmouseleave = () => item.style.backgroundColor = 'white';
        item.onclick = () => addLocationDirect(suggestion);
        
        container.appendChild(item);
    });
    
    console.log('Direct suggestions displayed:', suggestions.length);
}

function hideLocationSuggestions() {
    const container = document.getElementById('locationSuggestions');
    if (container) {
        container.style.display = 'none';
        container.classList.add('hidden');
    }
}

function addLocationDirect(locationName) {
    console.log('Adding location:', locationName);
    
    // Clear input
    const input = document.getElementById('locationInput');
    if (input) input.value = '';
    
    // Hide suggestions
    hideLocationSuggestions();
    
    // Try to use the main businessFinder if available
    if (window.businessFinder && window.businessFinder.addLocation) {
        window.businessFinder.addLocation(locationName);
    } else {
        // Fallback: just show an alert for now
        alert('Location selected: ' + locationName);
    }
}

// Fallback initialization
window.addEventListener('load', () => {
    if (!businessFinder) {
        console.log('Fallback initialization...');
        initializeBusinessFinder();
    }
});