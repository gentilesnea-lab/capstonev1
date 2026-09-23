/**
 * AI-Powered Residential Housing Planning and Estimation System - Capstone Wizard Script
 * driving location hazard auditing (Phase 1), house recommendation cards (Phase 2),
 * blueprint specs (Phase 3), cost computation with 2-worker default scheduler (Phase 4),
 * price forecasting (Phase 5), GIS risk details (Phase 6), and printable reports (Phase 7).
 */

document.addEventListener('DOMContentLoaded', () => {
    // HIERARCHICAL LOCATION LOOKUP DATA
    const LOCATIONS = {
        davao_norte: {
            name: 'Davao del Norte',
            cities: {
                panabo: {
                    name: 'Panabo City',
                    barangays: {
                        san_vicente: { name: 'San Vicente', risk: 'Moderate Risk', score: '72/100 (MODERATE)', flood: 'Low', seismic: 'Moderate', soil: 'Good', advisories: ['✓ Use reinforced concrete foundation', '✓ Apply seismic reinforcement', '✓ Use elevated floor level'] },
                        gredu: { name: 'Gredu', risk: 'Stable Low Risk', score: '38/100 (LOW)', flood: 'Low', seismic: 'Low', soil: 'Good', advisories: ['✓ Standard concrete pad foundations approved', '✓ Standard wood or steel framing allowed', '✓ Regular concrete hollow block walls compliant'] },
                        new_pandan: { name: 'New Pandan', risk: 'Stable Low Risk', score: '42/100 (LOW)', flood: 'Moderate', seismic: 'Low', soil: 'Fair', advisories: ['✓ Standard concrete pad foundations approved', '✓ Elevated floor levels recommended', '✓ Standard masonry construction approved'] },
                        quezon: { name: 'Quezon', risk: 'Moderate Risk', score: '65/100 (MODERATE)', flood: 'High', seismic: 'Low', soil: 'Good', advisories: ['✓ Use elevated floor level', '✓ Reinforced concrete slab construction', '✓ Improved storm drainage access'] }
                    }
                },
                tagum: {
                    name: 'Tagum City',
                    barangays: {
                        apokon: { name: 'Apokon', risk: 'Stable Low Risk', score: '30/100 (LOW)', flood: 'Low', seismic: 'Low', soil: 'Excellent', advisories: ['✓ Standard concrete pad foundations approved', '✓ Standard wood or steel framing allowed', '✓ Regular concrete hollow block walls compliant'] },
                        mankilam: { name: 'Mankilam', risk: 'Moderate Risk', score: '55/100 (MODERATE)', flood: 'Moderate', seismic: 'Low', soil: 'Good', advisories: ['✓ Reinforced slab-on-grade recommended', '✓ Adequate footing depths required', '✓ Dual concrete partition headers'] },
                        visayan_village: { name: 'Visayan Village', risk: 'Stable Low Risk', score: '35/100 (LOW)', flood: 'Low', seismic: 'Low', soil: 'Good', advisories: ['✓ Standard foundations approved', '✓ Multi-truss roof bracing recommended', '✓ Regular masonry walls allowed'] },
                        magugpo_west: { name: 'Magugpo West', risk: 'Stable Low Risk', score: '28/100 (LOW)', flood: 'Low', seismic: 'Low', soil: 'Excellent', advisories: ['✓ Standard structural layouts approved', '✓ Standard materials allowed', '✓ Regular concrete foundations'] }
                    }
                },
                samal: {
                    name: 'Samal City (IGACOS)',
                    barangays: {
                        babak: { name: 'Babak', risk: 'Moderate Risk', score: '50/100 (MODERATE)', flood: 'Low', seismic: 'Moderate', soil: 'Good', advisories: ['✓ Tie-wire rebar columns recommended', '✓ Elevated concrete ground piers', '✓ Coastal high-wind roof clips'] },
                        penaplata: { name: 'Peñaplata', risk: 'Stable Low Risk', score: '32/100 (LOW)', flood: 'Low', seismic: 'Low', soil: 'Good', advisories: ['✓ Standard foundations approved', '✓ Conventional timber or concrete design', '✓ Regular safety margins apply'] },
                        kaputian: { name: 'Kaputian', risk: 'Moderate Risk', score: '48/100 (MODERATE)', flood: 'Low', seismic: 'Moderate', soil: 'Fair', advisories: ['✓ Anti-scour footing reinforcement', '✓ Seismic column tie-wire bracing', '✓ Multi-pitch roof trusses'] },
                        villarica: { name: 'Villarica', risk: 'Stable Low Risk', score: '35/100 (LOW)', flood: 'Low', seismic: 'Low', soil: 'Good', advisories: ['✓ Standard concrete framing approved', '✓ Standard wooden trusses permitted', '✓ Ground slab structure approved'] }
                    }
                },
                carmen: {
                    name: 'Carmen',
                    barangays: {
                        ising: { name: 'Ising (Poblacion)', risk: 'Moderate Risk', score: '68/100 (MODERATE)', flood: 'Moderate', seismic: 'Low', soil: 'Good', advisories: ['✓ Elevated foundation floor levels', '✓ Solid concrete strip footing', '✓ Hurricane-resistant roofing'] },
                        alejal: { name: 'Alejal', risk: 'Stable Low Risk', score: '39/100 (LOW)', flood: 'Low', seismic: 'Low', soil: 'Good', advisories: ['✓ Standard ground pads approved', '✓ Standard framing layouts compliant', '✓ Conventional masonry allowed'] },
                        magsaysay: { name: 'Magsaysay', risk: 'High Danger Zone', score: '82/100 (HIGH RISK)', flood: 'High', seismic: 'Low', soil: 'Fair', advisories: ['✓ Raised concrete stilt structure required', '✓ Strong concrete tie-beams required', '✓ Heavy storm-rated roof clips'] },
                        tuganay: { name: 'Tuganay', risk: 'High Danger Zone', score: '85/100 (HIGH RISK)', flood: 'High', seismic: 'Low', soil: 'Poor', advisories: ['✓ Deep pile or stilt foundation mandatory', '✓ Soil stabilization treatment advised', '✓ Reinforced concrete wall frames'] }
                    }
                },
                sto_tomas: {
                    name: 'Sto. Tomas',
                    barangays: {
                        tibal_on: { name: 'Tibal-on', risk: 'Stable Low Risk', score: '34/100 (LOW)', flood: 'Low', seismic: 'Low', soil: 'Good', advisories: ['✓ Standard building specifications approved', '✓ Regular masonry walls allowed', '✓ Conventional slab base'] },
                        kimamon: { name: 'Kimamon', risk: 'Moderate Risk', score: '58/100 (MODERATE)', flood: 'Moderate', seismic: 'Low', soil: 'Good', advisories: ['✓ Elevated floor pads recommended', '✓ Increased footing thickness', '✓ Double-truss roof anchors'] },
                        san_miguel: { name: 'San Miguel', risk: 'Stable Low Risk', score: '40/100 (LOW)', flood: 'Low', seismic: 'Low', soil: 'Good', advisories: ['✓ Standard pad foundations approved', '✓ Standard timber or metal framing', '✓ Normal concrete blocks permitted'] },
                        new_visayas: { name: 'New Visayas', risk: 'Stable Low Risk', score: '36/100 (LOW)', flood: 'Low', seismic: 'Low', soil: 'Good', advisories: ['✓ Standard layouts compliant', '✓ Standard building materials approved', '✓ Conventional concrete foundation'] }
                    }
                }
            }
        },
        davao_sur: {
            name: 'Davao del Sur',
            cities: {
                davao_city: {
                    name: 'Davao City',
                    barangays: {
                        buhangin: { name: 'Buhangin', risk: 'Stable Low Risk', score: '35/100 (LOW)', flood: 'Low', seismic: 'Low', soil: 'Good', advisories: ['✓ Standard concrete pad foundations approved', '✓ Standard wood or steel framing allowed', '✓ Regular concrete hollow block walls compliant'] },
                        talomo: { name: 'Talomo', risk: 'Moderate Risk', score: '62/100 (MODERATE)', flood: 'High', seismic: 'Low', soil: 'Good', advisories: ['✓ Use elevated floor levels', '✓ Reinforced concrete structural slabs', '✓ Advanced foundation water sealants'] },
                        agdao: { name: 'Agdao', risk: 'Moderate Risk', score: '58/100 (MODERATE)', flood: 'Moderate', seismic: 'Low', soil: 'Fair', advisories: ['✓ Elevated foundation floor levels', '✓ Enhanced wall reinforcement bars', '✓ Solid base concrete strip footing'] },
                        toril: { name: 'Toril', risk: 'Stable Low Risk', score: '25/100 (LOW)', flood: 'Low', seismic: 'Low', soil: 'Excellent', advisories: ['✓ Standard foundations approved', '✓ Standard timber or metal framing', '✓ Normal concrete blocks permitted'] },
                        bajada: { name: 'Bajada', risk: 'Stable Low Risk', score: '30/100 (LOW)', flood: 'Low', seismic: 'Low', soil: 'Good', advisories: ['✓ Standard concrete ground base pads', '✓ Standard wood or steel framing', '✓ Regular masonry structure'] }
                    }
                },
                digos: {
                    name: 'Digos City',
                    barangays: {
                        tres_de_mayo: { name: 'Tres de Mayo', risk: 'Stable Low Risk', score: '28/100 (LOW)', flood: 'Low', seismic: 'Low', soil: 'Good', advisories: ['✓ Standard structural layouts approved', '✓ Standard materials approved', '✓ Regular concrete foundations'] },
                        zone_1: { name: 'Zone 1 (Poblacion)', risk: 'Stable Low Risk', score: '33/100 (LOW)', flood: 'Low', seismic: 'Low', soil: 'Good', advisories: ['✓ Standard building specifications approved', '✓ Regular masonry walls allowed', '✓ Conventional slab base'] },
                        matti: { name: 'Matti', risk: 'Moderate Risk', score: '45/100 (MODERATE)', flood: 'Low', seismic: 'Moderate', soil: 'Good', advisories: ['✓ Tie-wire rebar column mesh', '✓ Foundation seismic reinforcement', '✓ Elevated floor levels recommended'] },
                        colorado: { name: 'Colorado', risk: 'Moderate Risk', score: '52/100 (MODERATE)', flood: 'Low', seismic: 'Moderate', soil: 'Fair', advisories: ['✓ Solid strip concrete footing', '✓ Seismic column reinforcements', '✓ Dual concrete partition headers'] }
                    }
                }
            }
        },
        leyte: {
            name: 'Leyte',
            cities: {
                tacloban: {
                    name: 'Tacloban City',
                    barangays: {
                        anibong: { name: 'Anibong', risk: 'High Danger Zone', score: '88/100 (HIGH RISK)', flood: 'High (Storm Surge Basin)', seismic: 'Moderate', soil: 'Fair', advisories: ['✓ Elevated pillar concrete foundation strictly required', '✓ Heavy concrete structural wall reinforcements', '✓ Hurricane-resistant roof frame clips'] },
                        diit: { name: 'Diit', risk: 'Moderate Risk', score: '60/100 (MODERATE)', flood: 'Moderate', seismic: 'Low', soil: 'Good', advisories: ['✓ Elevated foundation floor level', '✓ Reinforced concrete wall frames', '✓ Solid base concrete strip footing'] },
                        san_jose: { name: 'San Jose', risk: 'High Danger Zone', score: '84/100 (HIGH RISK)', flood: 'High', seismic: 'Low', soil: 'Fair', advisories: ['✓ Elevated concrete stilt structures required', '✓ Heavy-duty rebar foundation grid', '✓ Hurricane strap locks on trusses'] },
                        marasbaras: { name: 'Marasbaras', risk: 'Moderate Risk', score: '55/100 (MODERATE)', flood: 'Moderate', seismic: 'Low', soil: 'Good', advisories: ['✓ Ground level elevation recommended', '✓ Increased concrete block structural steel', '✓ Standard storm-grade roofing'] }
                    }
                },
                ormoc: {
                    name: 'Ormoc City',
                    barangays: {
                        valencia: { name: 'Valencia', risk: 'Stable Low Risk', score: '30/100 (LOW)', flood: 'Low', seismic: 'Low', soil: 'Good', advisories: ['✓ Standard concrete pad foundations approved', '✓ Standard wood or steel framing allowed', '✓ Regular concrete hollow block walls compliant'] },
                        cogon: { name: 'Cogon', risk: 'Moderate Risk', score: '48/100 (MODERATE)', flood: 'Moderate', seismic: 'Low', soil: 'Good', advisories: ['✓ Elevated floor pads recommended', '✓ Solid concrete strip footing', '✓ Standard storm-grade roofing'] },
                        can_adieng: { name: 'Can-adieng', risk: 'Moderate Risk', score: '52/100 (MODERATE)', flood: 'High', seismic: 'Low', soil: 'Fair', advisories: ['✓ Elevated concrete stilt foundations', '✓ Reinforced slab-on-grade framing', '✓ Anti-scour footing reinforcement'] },
                        linao: { name: 'Linao', risk: 'Moderate Risk', score: '56/100 (MODERATE)', flood: 'High', seismic: 'Low', soil: 'Good', advisories: ['✓ Ground level elevation required', '✓ Standard masonry construction approved', '✓ Elevated floor levels recommended'] }
                    }
                }
            }
        }
    };

    // SYSTEM GLOBAL STATE
    const state = {
        province: 'davao_norte',
        city: 'panabo',
        barangay: 'san_vicente',
        lot: 'Zone 3, Lot 14-B',
        
        activeHouse: 'elevated', // Selected recommended house design
        crewSize: 2,             // Initialized strictly to 2 Workers as per capstone guidelines
        
        // Dynamic location hazard indexes (Phase 1 & Phase 6)
        locationAnalysis: {
            title: 'Location Status: Moderate Risk',
            gisScore: '72/100 (MODERATE)',
            flood: 'Low',
            seismic: 'Moderate',
            soil: 'Good',
            advisories: [
                '✓ Use reinforced concrete foundation',
                '✓ Apply seismic reinforcement',
                '✓ Use elevated floor level'
            ]
        },

        // Material current price indicators (Phase 5)
        rates: {
            cement: 280,      // per bag
            steel: 75,       // per kg (current)
            bricks: 15,       // per pc (CHB)
            sand: 1500,       // per m3
            wood: 80,         // per bd ft (coco lumber)
            roof: 450,        // per m2
            paint: 250,       // per liter
            fixtures: 4500,   // per utilities set
            labor: 650        // daily wage PHP
        },

        // Detailed House Models (Phase 2 & Phase 3)
        houses: {
            bungalow: {
                id: 'bungalow',
                name: 'Small Bungalow Concrete',
                price: 130000,
                area: 45,
                beds: 2,
                baths: 1,
                img: 'Img/Small_House.png',
                blueprint: 'Img/Small_House_BluePrint.png',
                safetyScore: '94%',
                foundation: 'Reinforced Strip Footing',
                walls: 'Reinforced CHB Masonry',
                roof: 'Gable Steel Trusses',
                adaptations: ['✓ Solid strip concrete footing', '✓ Seismic columns tie-wire bracing', '✓ Hurricane strap locks'],
                baseDays: 18, // scaled for lower budget
                multipliers: { cement: 25, steel: 200, bricks: 600, sand: 3, lumber: 300, roof: 25, paint: 20, fixtures: 1 }
            },
            family: {
                id: 'family',
                name: 'Family House Modern Concrete',
                price: 200000,
                area: 70,
                beds: 3,
                baths: 2,
                img: 'Img/house_standard.png',
                blueprint: 'Img/blueprint_standard.png',
                safetyScore: '96%',
                foundation: 'Reinforced Concrete Slab-on-Grade',
                walls: 'Load-Bearing CHB Columns',
                roof: 'Hip Profile GI Steel Sheets',
                adaptations: ['✓ Heavy rebar base grid', '✓ Dual concrete partition headers', '✓ Double-truss roof anchors'],
                baseDays: 25,
                multipliers: { cement: 40, steel: 300, bricks: 800, sand: 5, lumber: 400, roof: 35, paint: 30, fixtures: 2 }
            },
            elevated: {
                id: 'elevated',
                name: 'Elevated Flood-Resistant House',
                price: 180000,
                area: 60,
                beds: 2,
                baths: 1,
                img: 'Img/house_elevated.png',
                blueprint: 'Img/blueprint_elevated.png',
                safetyScore: '98%',
                foundation: 'Concrete Stilt Columns (Elevated)',
                walls: 'Lightweight Concrete Masonry',
                roof: 'Storm-Grade Gable Steel Framing',
                adaptations: ['✓ Elevated foundation floor stilt pillars', '✓ Anti-scour footing reinforcement', '✓ Aerodynamic roof profiling'],
                baseDays: 22,
                multipliers: { cement: 30, steel: 250, bricks: 500, sand: 4, lumber: 300, roof: 28, paint: 20, fixtures: 1.5, specialty: 20000 }
            },
            wood_cabin: {
                id: 'wood_cabin',
                name: 'Native Eco-Wood Cabin',
                price: 100000,
                area: 50,
                beds: 2,
                baths: 1,
                img: 'Img/house_wood_cabin.png',
                blueprint: 'Img/House_wood_cabin_blueprint.png',
                safetyScore: '92%',
                foundation: 'Raised Timber Pier Footings',
                walls: 'Treated Hardwood / Coco Lumber framing',
                roof: 'Light-gauge ribbed GI steel sheets',
                adaptations: ['✓ Flexible pier timber framing', '✓ High wind-load wooden trusses', '✓ Natural cross-ventilation styling'],
                baseDays: 15,
                multipliers: { cement: 10, steel: 100, bricks: 200, sand: 2, lumber: 300, roof: 20, paint: 15, fixtures: 1 }
            },
            wood_villa: {
                id: 'wood_villa',
                name: 'Premium Timber Frame Villa',
                price: 150000,
                area: 85,
                beds: 4,
                baths: 3,
                img: 'Img/Simi_Wood_Houses.png',
                blueprint: 'Img/Simi_Wood_Houses_Blueprint.png',
                safetyScore: '95%',
                foundation: 'Reinforced Concrete Ground Piers',
                walls: 'Solid Timber Panel Prefab framing',
                roof: 'High-pitch heavy wood structural trusses',
                adaptations: ['✓ Seismic solid-wood joint locks', '✓ Dual foundation anchor points', '✓ High-tensile steel truss brackets'],
                baseDays: 20,
                multipliers: { cement: 20, steel: 200, bricks: 400, sand: 3, lumber: 500, roof: 30, paint: 25, fixtures: 1 }
            }
        }
    };

    // DOM ELEMENTS - Step 1 Location
    const provinceSelect = document.getElementById('provinceSelect');
    const citySelect = document.getElementById('citySelect');
    const barangaySelect = document.getElementById('barangaySelect');
    const lotDetails = document.getElementById('lotDetails');
    const btnAuditLocation = document.getElementById('btnAuditLocation');

    // DOM ELEMENTS - Location Assessment Reports
    const gisSafetyOutput = document.getElementById('gisSafetyOutput');
    const recommendationTitle = document.getElementById('recommendationTitle');
    const recommendationDesc = document.getElementById('recommendationDesc');
    const lblFloodRisk = document.getElementById('lblFloodRisk');
    const lblSeismicRisk = document.getElementById('lblSeismicRisk');
    const lblSoilRisk = document.getElementById('lblSoilRisk');
    const lblRiskAdvice = document.getElementById('lblRiskAdvice');
    const lblGisScore = document.getElementById('lblGisScore');
    const houseSelectionGrid = document.getElementById('houseSelectionGrid');
    const gisMapSvg = document.getElementById('gisMapSvg');
    const gisMapCoords = document.getElementById('gisMapCoords');

    // DOM ELEMENTS - Wizard Layout screens
    const step1Container = document.getElementById('step1Container');
    const step2Container = document.getElementById('step2Container');
    const stepIndicator1 = document.getElementById('stepIndicator1');
    const stepIndicator2 = document.getElementById('stepIndicator2');
    const stepBadge2 = document.getElementById('stepBadge2');
    const wizardProgressBar = document.getElementById('wizardProgressBar');
    const btnBackToStep1 = document.getElementById('btnBackToStep1');

    // DOM ELEMENTS - Step 2 Targets
    const step2Location = document.getElementById('step2Location');
    const step2HousePrice = document.getElementById('step2HousePrice');
    const step2HouseImg = document.getElementById('step2HouseImg');
    const step2BlueprintImg = document.getElementById('step2BlueprintImg');
    const step2MaterialsBody = document.getElementById('step2MaterialsBody');
    const laborCrewSlider = document.getElementById('laborCrewSlider');
    const laborCrewLabel = document.getElementById('laborCrewLabel');
    const sysCrewBadge = document.getElementById('sysCrewBadge');
    const laborTimeDuration = document.getElementById('laborTimeDuration');

    const printFoundationType = document.getElementById('printFoundationType');
    const printWallMaterial = document.getElementById('printWallMaterial');
    const printRoofMaterial = document.getElementById('printRoofMaterial');
    const printRiskAdapt1 = document.getElementById('printRiskAdapt1');
    const printRiskAdapt2 = document.getElementById('printRiskAdapt2');
    const printRiskAdapt3 = document.getElementById('printRiskAdapt3');

    // DOM ELEMENTS - Printable reports (Phase 7)
    const sysExportBtn = document.getElementById('sysExportBtn');
    const sysExportModal = document.getElementById('sysExportModal');
    const btnCloseSysModal = document.getElementById('btnCloseSysModal');
    const btnPrintSysActual = document.getElementById('btnPrintSysActual');
    const printSysDateString = document.getElementById('printSysDateString');

    const printProvince = document.getElementById('printProvince');
    const printCity = document.getElementById('printCity');
    const printBarangay = document.getElementById('printBarangay');
    const printRiskRating = document.getElementById('printRiskRating');
    const printArea = document.getElementById('printArea');
    const printBedBaths = document.getElementById('printBedBaths');
    const printWalls = document.getElementById('printWalls');
    const printRoof = document.getElementById('printRoof');
    const printGisScore = document.getElementById('printGisScore');
    const printGisDesc = document.getElementById('printGisDesc');
    const printCrew = document.getElementById('printCrew');
    const printDuration = document.getElementById('printDuration');
    const printTotalPrice = document.getElementById('printTotalPrice');
    const printMaterialsTableBody = document.getElementById('printMaterialsTableBody');

    // -------------------------------------------------------------
    // INITIALIZATION
    // -------------------------------------------------------------
    function init() {
        // Dropdown dynamic changes
        if (provinceSelect) {
            provinceSelect.addEventListener('change', () => {
                reloadCities();
                auditGeospatialRisks();
            });
        }
        if (citySelect) {
            citySelect.addEventListener('change', () => {
                reloadBarangays();
                auditGeospatialRisks();
            });
        }
        if (barangaySelect) {
            barangaySelect.addEventListener('change', () => {
                auditGeospatialRisks();
            });
        }

        // Location Risk Audit trigger
        if (btnAuditLocation) {
            btnAuditLocation.addEventListener('click', auditGeospatialRisks);
        }

        // Back to Step 1 triggers
        if (btnBackToStep1) {
            btnBackToStep1.addEventListener('click', () => {
                transitionWizard(1);
            });
        }

        // Labor crew workforce slider triggers
        if (laborCrewSlider) {
            laborCrewSlider.addEventListener('input', (e) => {
                state.crewSize = parseInt(e.target.value);
                if (laborCrewLabel) laborCrewLabel.innerText = `${state.crewSize} Workers`;
                if (sysCrewBadge) sysCrewBadge.innerText = `${state.crewSize} Workers`;
                
                // Recalculate bill of materials and timeline duration
                calculateHouseProposal();
            });
        }

        // Phase 7: Export modal actions
        if (sysExportBtn) {
            sysExportBtn.addEventListener('click', openFinalReportModal);
        }
        if (btnCloseSysModal) {
            btnCloseSysModal.addEventListener('click', () => sysExportModal.style.display = 'none');
        }
        if (btnPrintSysActual) {
            btnPrintSysActual.addEventListener('click', () => window.print());
        }

        // Populate initial dropdowns dynamically
        reloadCities();

        // Load initial selection grid
        auditGeospatialRisks();
    }

    // -------------------------------------------------------------
    // DYNAMIC DROPDOWN LOADS
    // -------------------------------------------------------------
    // -------------------------------------------------------------
    // DYNAMIC DROPDOWN LOADS (Province -> City -> Barangay)
    // -------------------------------------------------------------
    function reloadCities() {
        const provKey = provinceSelect.value;
        const provData = LOCATIONS[provKey];
        citySelect.innerHTML = '';
        if (provData && provData.cities) {
            Object.keys(provData.cities).forEach(cityKey => {
                const option = document.createElement('option');
                option.value = cityKey;
                option.innerText = provData.cities[cityKey].name;
                citySelect.appendChild(option);
            });
        }
        reloadBarangays();
    }

    function reloadBarangays() {
        const provKey = provinceSelect.value;
        const cityKey = citySelect.value;
        const provData = LOCATIONS[provKey];
        barangaySelect.innerHTML = '';
        if (provData && provData.cities && provData.cities[cityKey]) {
            const barangays = provData.cities[cityKey].barangays;
            Object.keys(barangays).forEach(bKey => {
                const option = document.createElement('option');
                option.value = bKey;
                option.innerText = barangays[bKey].name;
                barangaySelect.appendChild(option);
            });
        }
    }

    // -------------------------------------------------------------
    // PHASE 1: GEOSPATIAL AUDIT
    // -------------------------------------------------------------
    function auditGeospatialRisks() {
        const provKey = provinceSelect.value;
        const cityKey = citySelect.value;
        const bKey = barangaySelect.value;

        const provData = LOCATIONS[provKey];
        if (!provData) return;
        const cityData = provData.cities[cityKey];
        if (!cityData) return;
        const bData = cityData.barangays[bKey];
        if (!bData) return;

        state.province = provData.name;
        state.city = cityData.name;
        state.barangay = bData.name;
        state.lot = lotDetails.value.trim() || 'Zone 3, Lot 14-B';

        state.locationAnalysis = {
            title: `Location Status: ${bData.risk}`,
            gisScore: bData.score,
            flood: bData.flood,
            seismic: bData.seismic,
            soil: bData.soil,
            advisories: bData.advisories
        };

        // Render audited location info in Phase 1 panel
        if (recommendationTitle) recommendationTitle.innerText = state.locationAnalysis.title;
        if (lblFloodRisk) {
            lblFloodRisk.innerText = state.locationAnalysis.flood;
            lblFloodRisk.style.color = state.locationAnalysis.flood.includes('High') ? '#ef4444' : 'var(--green-600)';
        }
        if (lblSeismicRisk) {
            lblSeismicRisk.innerText = state.locationAnalysis.seismic;
            lblSeismicRisk.style.color = state.locationAnalysis.seismic.includes('High') ? '#ef4444' : (state.locationAnalysis.seismic.includes('Moderate') ? 'var(--orange-500)' : 'var(--green-600)');
        }
        if (lblSoilRisk) {
            lblSoilRisk.innerText = state.locationAnalysis.soil;
            lblSoilRisk.style.color = state.locationAnalysis.soil.includes('Poor') ? '#ef4444' : (state.locationAnalysis.soil.includes('Fair') ? 'var(--orange-500)' : 'var(--green-600)');
        }
        if (lblGisScore) {
            lblGisScore.innerText = state.locationAnalysis.gisScore;
            lblGisScore.style.color = state.locationAnalysis.gisScore.includes('HIGH') ? '#ef4444' : (state.locationAnalysis.gisScore.includes('MODERATE') ? 'var(--orange-500)' : 'var(--green-600)');
        }

        // Parse numerical hazard score from "72/100 (MODERATE)" to update threat meter
        const numericScore = parseInt(bData.score.split('/')[0]) || 50;
        const hazardMeterFill = document.getElementById('hazardMeterFill');
        if (hazardMeterFill) {
            hazardMeterFill.style.width = `${numericScore}%`;
            if (numericScore < 45) {
                hazardMeterFill.style.background = 'var(--green-500)';
            } else if (numericScore < 75) {
                hazardMeterFill.style.background = 'var(--orange-500)';
            } else {
                hazardMeterFill.style.background = '#ef4444';
            }
        }

        // Update advisor bullet points
        if (lblRiskAdvice) {
            lblRiskAdvice.innerHTML = '';
            state.locationAnalysis.advisories.forEach(adv => {
                const li = document.createElement('li');
                li.innerText = adv;
                lblRiskAdvice.appendChild(li);
            });
        }

        // RENDER RECOMMENDED HOUSE CARDS
        renderRecommendedHousesGrid(bData.risk);

        // DRAW DYNAMIC REGIONAL GIS VECTOR MAP
        drawInteractiveMap(provKey, cityKey, bKey);
    }

    function renderRecommendedHousesGrid(riskLevel) {
        if (!houseSelectionGrid) return;
        houseSelectionGrid.innerHTML = '';

        // Select houses based on location risk compatibility
        let list = [];
        if (riskLevel.includes('High')) {
            // High Risk: Recommend elevated flood house, family masonry, premium timber frame villa (safe designs)
            list = [state.houses.elevated, state.houses.family, state.houses.wood_villa];
        } else if (riskLevel.includes('Moderate')) {
            // Moderate Risk: Recommend elevated, bungalow, eco-wood cabin
            list = [state.houses.elevated, state.houses.wood_cabin, state.houses.bungalow];
        } else {
            // Low Risk: Recommend all options (family, bungalow, wood villa, wood_cabin)
            list = [state.houses.family, state.houses.bungalow, state.houses.wood_villa, state.houses.wood_cabin];
        }

        list.forEach(h => {
            const card = document.createElement('div');
            card.className = 'ai-house-card';
            card.style.cursor = 'pointer';
            card.style.border = '2px solid var(--sky-200)';
            card.style.borderRadius = 'var(--radius-md)';
            card.style.overflow = 'hidden';
            card.style.background = 'white';
            card.style.position = 'relative';

            // Special badge for wood designs
            let woodBadge = '';
            if (h.id.includes('wood')) {
                woodBadge = `<span style="position: absolute; top: 0.5rem; left: 0.5rem; background: #854d0e; color: white; padding: 0.15rem 0.4rem; border-radius: 4px; font-size: 0.65rem; font-weight: 700; font-family: var(--font-heading);"><i class="fa-solid fa-tree"></i> Timber</span>`;
            }

            card.innerHTML = `
                <div class="house-img-container" style="position: relative; height: 120px; overflow: hidden; background: #0b1329;">
                    <img src="${h.img}" alt="${h.name}" style="width: 100%; height: 100%; object-fit: cover;">
                    ${woodBadge}
                    <span style="position: absolute; top: 0.5rem; right: 0.5rem; background: var(--sky-500); color: white; padding: 0.15rem 0.4rem; border-radius: 4px; font-size: 0.65rem; font-weight: 700; font-family: var(--font-heading);"><i class="fa-solid fa-shield"></i> ${h.safetyScore} Safety</span>
                </div>
                <div class="house-details" style="padding: 0.8rem; text-align: center;">
                    <h4 class="house-price-label" style="font-family: var(--font-heading); font-size: 1.15rem; color: var(--sky-700); font-weight: 800; line-height: 1;">₱${h.price.toLocaleString('en-US')}</h4>
                    <span style="font-size: 0.7rem; color: var(--slate-500); font-weight: 600; display: block; margin-top: 0.25rem;">${h.area} sqm | ${h.beds} Beds | ${h.baths} Baths</span>
                </div>
            `;

            // Card click transitions wizard to Step 2
            card.addEventListener('click', () => {
                state.activeHouse = h.id;
                transitionWizard(2);
            });

            houseSelectionGrid.appendChild(card);
        });
    }

    // -------------------------------------------------------------
    // WIZARD VIEW TRANSITIONS
    // -------------------------------------------------------------
    function transitionWizard(stepNum) {
        if (stepNum === 1) {
            // Show Step 1 screen, hide Step 2
            step1Container.style.display = 'block';
            step2Container.style.display = 'none';

            // Update navigation bar progress badges (handled by CSS classes)
            stepIndicator1.classList.add('active');
            stepIndicator2.classList.remove('active');

            wizardProgressBar.style.width = '0%';
        } else {
            // Show Step 2, hide Step 1
            step1Container.style.display = 'none';
            step2Container.style.display = 'block';

            // Update navigation bar progress badges (handled by CSS classes)
            stepIndicator1.classList.remove('active');
            stepIndicator2.classList.add('active');

            wizardProgressBar.style.width = '100%';

            // Populate Step 2 cost sheets & specs
            updateStep2Estimate();
        }
    }

    // -------------------------------------------------------------
    // PHASE 3 & 4: ESTIMATOR AND DYNAMIC LABOR ENGINE
    // -------------------------------------------------------------
    function updateStep2Estimate() {
        const house = state.houses[state.activeHouse];
        if (!house) return;

        // Setup Location and visual displays
        if (step2Location) {
            step2Location.innerText = `${state.barangay}, ${state.city}, ${state.province}`;
        }
        if (step2HousePrice) {
            step2HousePrice.innerText = `₱${house.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
        }

        // Sync visual render and blueprint graphics
        if (step2HouseImg) {
            step2HouseImg.src = house.img;
            if (state.activeHouse === 'seismic') {
                step2HouseImg.style.filter = 'hue-rotate(50deg)';
            } else if (state.activeHouse === 'wood_villa') {
                step2HouseImg.style.filter = 'sepia(0.2) saturate(1.2) hue-rotate(-20deg)';
            } else {
                step2HouseImg.style.filter = 'none';
            }
        }
        if (step2BlueprintImg) {
            step2BlueprintImg.src = house.blueprint;
        }

        // Sync Phase 3 Specifications
        if (printFoundationType) printFoundationType.innerText = house.foundation;
        if (printWallMaterial) printWallMaterial.innerText = house.walls;
        if (printRoofMaterial) printRoofMaterial.innerText = house.roof;

        if (printRiskAdapt1) printRiskAdapt1.innerText = house.adaptations[0] || '';
        if (printRiskAdapt2) printRiskAdapt2.innerText = house.adaptations[1] || '';
        if (printRiskAdapt3) printRiskAdapt3.innerText = house.adaptations[2] || '';

        // Reset workforce slider configurations to 2 Workers initially as required
        state.crewSize = 2;
        if (laborCrewSlider) laborCrewSlider.value = 2;
        if (laborCrewLabel) laborCrewLabel.innerText = '2 Workers';
        if (sysCrewBadge) sysCrewBadge.innerText = '2 Workers';

        // Recalculate cost table
        calculateHouseProposal();
    }

    function calculateDuration(baseDays, crewSize) {
        if (crewSize === 2) return baseDays;
        if (crewSize === 4) return Math.ceil(baseDays * 0.67);
        if (crewSize === 6) return Math.ceil(baseDays * 0.45);
        return Math.ceil(baseDays * (3 / crewSize));
    }

    function calculateHouseProposal() {
        const house = state.houses[state.activeHouse];
        if (!house) return;

        // Dynamic Labor schedule days (Phase 4 Labor)
        const daysRequired = calculateDuration(house.baseDays, state.crewSize);

        if (laborTimeDuration) {
            laborTimeDuration.innerText = `${daysRequired} Working Days (AI Calibrated)`;
        }

        // labor daily cost calculations
        const totalLaborCost = state.crewSize * daysRequired * state.rates.labor;

        // Compile material list (Phase 4 Materials)
        const mult = house.multipliers;
        const matItems = [
            { name: 'Portland Cement (Base Structural)', qty: mult.cement, unit: 'Bags', rate: state.rates.cement, cost: mult.cement * state.rates.cement },
            { name: 'Deformed Steel Bars (Structural rebars)', qty: mult.steel, unit: 'kg', rate: state.rates.steel, cost: mult.steel * state.rates.steel },
            { name: 'CHB Hollow Concrete Blocks (Walls)', qty: mult.bricks, unit: 'pcs', rate: state.rates.bricks, cost: mult.bricks * state.rates.bricks },
            { name: 'Coarse Sand & Gravel (Footings foundation)', qty: mult.sand, unit: 'm³', rate: state.rates.sand, cost: mult.sand * state.rates.sand },
            { name: 'Coco Structural Lumber (Scaffold framing)', qty: mult.lumber, unit: 'bd ft', rate: state.rates.wood, cost: mult.lumber * state.rates.wood },
            { name: 'Pre-painted GI Roof Panels (Roof envelope)', qty: mult.roof, unit: 'm²', rate: state.rates.roof, cost: mult.roof * state.rates.roof },
            { name: 'Davies Latex Coatings (Interior/Exterior paint)', qty: mult.paint, unit: 'Liters', rate: state.rates.paint, cost: mult.paint * state.rates.paint },
            { name: 'Plumbing & Electrical Fixtures (Utilities Pack)', qty: mult.fixtures, unit: 'Sets', rate: state.rates.fixtures, cost: mult.fixtures * state.rates.fixtures }
        ];

        // Add specialty concrete stilt surcharge for elevated house
        if (house.specialty > 0) {
            let label = 'Specialty Concrete Stilt Columns (Elevated Foundations)';
            if (state.activeHouse === 'wood_villa') {
                label = 'Specialty High-Tensile Steel Bracing Package';
            }
            matItems.push({ name: label, qty: 1, unit: 'Unit', rate: house.specialty, cost: house.specialty });
        }

        const totalMaterialsCost = matItems.reduce((sum, item) => sum + item.cost, 0);

        // Permits & Contingency estimations (12% standard capstone margin)
        const permitsCost = Math.round(calculatedBasePrice() * 0.05);
        const contingencyCost = Math.round(calculatedBasePrice() * 0.07);

        function calculatedBasePrice() {
            return house.price;
        }

        // Final aggregated complete house budget
        const finalCalculatedCost = totalMaterialsCost + totalLaborCost + permitsCost + contingencyCost;

        // Sync dynamic final price back to display label
        if (step2HousePrice) {
            step2HousePrice.innerText = `₱${finalCalculatedCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
        }

        // Render Step 2 Cost table
        if (step2MaterialsBody) {
            step2MaterialsBody.innerHTML = '';
            
            // Materials rows
            matItems.forEach(item => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="font-size: 0.8rem; padding: 0.45rem 0.75rem; color: var(--slate-800); font-weight: 500;">${item.name}</td>
                    <td style="font-size: 0.8rem; padding: 0.45rem 0.75rem; color: var(--slate-500); font-weight: 600;">${item.qty.toLocaleString()} ${item.unit}</td>
                    <td style="font-size: 0.8rem; padding: 0.45rem 0.75rem; color: var(--slate-900); font-weight: 700;" class="text-right">₱${item.cost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                `;
                step2MaterialsBody.appendChild(tr);
            });

            // Dynamic Labor row
            const laborTr = document.createElement('tr');
            laborTr.style.background = 'rgba(14, 165, 233, 0.03)';
            laborTr.innerHTML = `
                <td style="font-size: 0.8rem; padding: 0.5rem 0.75rem; color: var(--sky-700); font-weight: 700;"><i class="fa-solid fa-people-carry-box"></i> Dynamic Construction Labor Cost</td>
                <td style="font-size: 0.8rem; padding: 0.5rem 0.75rem; color: var(--sky-600); font-weight: 700;">${state.crewSize} Workers (${daysRequired} Days)</td>
                <td style="font-size: 0.8rem; padding: 0.5rem 0.75rem; color: var(--sky-700); font-weight: 800;" class="text-right">₱${totalLaborCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            `;
            step2MaterialsBody.appendChild(laborTr);

            // Permits & Contingency row
            const permitsTr = document.createElement('tr');
            permitsTr.innerHTML = `
                <td style="font-size: 0.8rem; padding: 0.45rem 0.75rem; color: var(--slate-600); font-weight: 500;"><i class="fa-solid fa-file-contract"></i> Government Permits &amp; Insurance</td>
                <td style="font-size: 0.8rem; padding: 0.45rem 0.75rem; color: var(--slate-500); font-weight: 600;">Standard Capstone Margin</td>
                <td style="font-size: 0.8rem; padding: 0.45rem 0.75rem; color: var(--slate-900); font-weight: 700;" class="text-right">₱${permitsCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            `;
            step2MaterialsBody.appendChild(permitsTr);

            const contingencyTr = document.createElement('tr');
            contingencyTr.innerHTML = `
                <td style="font-size: 0.8rem; padding: 0.45rem 0.75rem; color: var(--slate-600); font-weight: 500;"><i class="fa-solid fa-triangle-exclamation"></i> Emergency Construction Contingency</td>
                <td style="font-size: 0.8rem; padding: 0.45rem 0.75rem; color: var(--slate-500); font-weight: 600;">7% Buffer</td>
                <td style="font-size: 0.8rem; padding: 0.45rem 0.75rem; color: var(--slate-900); font-weight: 700;" class="text-right">₱${contingencyCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            `;
            step2MaterialsBody.appendChild(contingencyTr);

            // Dynamic Total Valuation row
            const totalTr = document.createElement('tr');
            totalTr.style.background = 'var(--sky-50)';
            totalTr.style.borderTop = '2px solid var(--sky-300)';
            totalTr.innerHTML = `
                <td style="font-size: 0.85rem; padding: 0.6rem 0.75rem; color: var(--slate-900); font-weight: 800;">TOTAL ESTIMATED BUDGET</td>
                <td style="font-size: 0.85rem; padding: 0.6rem 0.75rem; color: var(--slate-500); font-weight: 700;">Complete House Valuation</td>
                <td style="font-size: 0.9rem; padding: 0.6rem 0.75rem; color: var(--sky-800); font-weight: 900;" class="text-right">₱${finalCalculatedCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            `;
            step2MaterialsBody.appendChild(totalTr);
        }
    }

    // -------------------------------------------------------------
    // PHASE 7: EXPORT PRINTABLE CAPSTONE PROSPECTUS
    // -------------------------------------------------------------
    function openFinalReportModal() {
        const house = state.houses[state.activeHouse];
        if (!house) return;

        // Capture dynamic values from estimator
        const daysRequired = calculateDuration(house.baseDays, state.crewSize);
        const totalLaborCost = state.crewSize * daysRequired * state.rates.labor;
        const permitsCost = Math.round(house.price * 0.05);
        const contingencyCost = Math.round(house.price * 0.07);

        // Re-compile item rows to copy to printed page
        const mult = house.multipliers;
        const matItems = [
            { name: 'Portland Cement (Base Structural)', qty: mult.cement, unit: 'Bags', rate: state.rates.cement, cost: mult.cement * state.rates.cement },
            { name: 'Deformed Steel Bars (Structural rebars)', qty: mult.steel, unit: 'kg', rate: state.rates.steel, cost: mult.steel * state.rates.steel },
            { name: 'CHB Hollow Concrete Blocks (Walls)', qty: mult.bricks, unit: 'pcs', rate: state.rates.bricks, cost: mult.bricks * state.rates.bricks },
            { name: 'Sand & Gravel (Footings foundation)', qty: mult.sand, unit: 'm³', rate: state.rates.sand, cost: mult.sand * state.rates.sand },
            { name: 'Coco Structural Lumber (Scaffold framing)', qty: mult.lumber, unit: 'bd ft', rate: state.rates.wood, cost: mult.lumber * state.rates.wood },
            { name: 'Pre-painted GI Roof Panels', qty: mult.roof, unit: 'm²', rate: state.rates.roof, cost: mult.roof * state.rates.roof },
            { name: 'Davies Latex Coatings (Wall paints)', qty: mult.paint, unit: 'Liters', rate: state.rates.paint, cost: mult.paint * state.rates.paint },
            { name: 'Plumbing & Electrical Fixtures Pack', qty: mult.fixtures, unit: 'Sets', rate: state.rates.fixtures, cost: mult.fixtures * state.rates.fixtures }
        ];
        if (house.specialty > 0) {
            let label = 'Specialty Concrete Stilt Columns';
            if (state.activeHouse === 'wood_villa') {
                label = 'Specialty Steel Bracing Surcharges';
            }
            matItems.push({ name: label, qty: 1, unit: 'Unit', rate: house.specialty, cost: house.specialty });
        }

        const totalMaterialsCost = matItems.reduce((sum, item) => sum + item.cost, 0);
        const finalTotalPriceVal = totalMaterialsCost + totalLaborCost + permitsCost + contingencyCost;

        // Hydrate Phase 7 Printable summary elements
        if (printProvince) printProvince.innerText = state.province;
        if (printCity) printCity.innerText = state.city;
        if (printBarangay) printBarangay.innerText = state.barangay;
        if (printRiskRating) printRiskRating.innerText = state.locationAnalysis.title.replace('Location Status: ', '');

        if (printArea) printArea.innerText = `${house.area} sqm`;
        if (printBedBaths) printBedBaths.innerText = `${house.beds} Bedrooms / ${house.baths} Bathrooms`;
        if (printWalls) printWalls.innerText = house.walls;
        if (printRoof) printRoof.innerText = house.roof;

        if (printGisScore) printGisScore.innerText = state.locationAnalysis.gisScore;
        if (printGisDesc) {
            printGisDesc.innerText = `Geospatial coordinates assessed inside ${state.barangay}, ${state.city}. Risk profile reveals Flood Risk: ${state.locationAnalysis.flood} and Seismic proximity: ${state.locationAnalysis.seismic}. Appropriate foundation adaptations applied.`;
        }

        if (printCrew) printCrew.innerText = `${state.crewSize} Workers`;
        if (printDuration) printDuration.innerText = `${daysRequired} Working Days`;
        if (printTotalPrice) {
            printTotalPrice.innerText = `₱${finalTotalPriceVal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
        }

        // Sync blueprint visual renders in print pane
        const printHouseImg = document.getElementById('printHouseImg');
        const printBlueprintImg = document.getElementById('printBlueprintImg');
        if (printHouseImg) {
            printHouseImg.src = house.img;
            if (state.activeHouse === 'seismic') {
                printHouseImg.style.filter = 'hue-rotate(50deg)';
            } else if (state.activeHouse === 'wood_villa') {
                printHouseImg.style.filter = 'sepia(0.2) saturate(1.2) hue-rotate(-20deg)';
            } else {
                printHouseImg.style.filter = 'none';
            }
        }
        if (printBlueprintImg) {
            printBlueprintImg.src = house.blueprint;
        }

        // Set generated report timestamp
        const dateObj = new Date();
        if (printSysDateString) {
            printSysDateString.innerText = `Generated Report Date: ${dateObj.toLocaleDateString()} @ ${dateObj.toLocaleTimeString()}`;
        }

        // Hydrate printed breakdown table body
        if (printMaterialsTableBody) {
            printMaterialsTableBody.innerHTML = '';
            
            // Materials
            matItems.forEach(item => {
                const tr = document.createElement('tr');
                tr.style.borderBottom = '1px solid var(--slate-100)';
                tr.innerHTML = `
                    <td style="padding: 0.4rem 0;"><strong>${item.name}</strong></td>
                    <td style="padding: 0.4rem 0;">${item.qty.toLocaleString()} ${item.unit}</td>
                    <td style="padding: 0.4rem 0; text-align: right;">₱${item.cost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                `;
                printMaterialsTableBody.appendChild(tr);
            });

            // Labor
            const laborTr = document.createElement('tr');
            laborTr.style.borderBottom = '1px solid var(--slate-100)';
            laborTr.innerHTML = `
                <td style="padding: 0.4rem 0;"><strong>Labor Cost (${state.crewSize} Workers)</strong></td>
                <td style="padding: 0.4rem 0;">${daysRequired} Days @ ₱650/day</td>
                <td style="padding: 0.4rem 0; text-align: right;">₱${totalLaborCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            `;
            printMaterialsTableBody.appendChild(laborTr);

            // Permits
            const permitsTr = document.createElement('tr');
            permitsTr.style.borderBottom = '1px solid var(--slate-100)';
            permitsTr.innerHTML = `
                <td style="padding: 0.4rem 0;"><strong>Permits &amp; Environmental Clearance</strong></td>
                <td style="padding: 0.4rem 0;">5% Base Allowance</td>
                <td style="padding: 0.4rem 0; text-align: right;">₱${permitsCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            `;
            printMaterialsTableBody.appendChild(permitsTr);

            // Contingency
            const contingencyTr = document.createElement('tr');
            contingencyTr.style.borderBottom = '1px solid var(--slate-100)';
            contingencyTr.innerHTML = `
                <td style="padding: 0.4rem 0;"><strong>Contingency Buffer</strong></td>
                <td style="padding: 0.4rem 0;">7% Emergency Margin</td>
                <td style="padding: 0.4rem 0; text-align: right;">₱${contingencyCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            `;
            printMaterialsTableBody.appendChild(contingencyTr);

            // Grand Total Sum Row
            const totalTr = document.createElement('tr');
            totalTr.style.borderTop = '2.5px double var(--sky-500)';
            totalTr.innerHTML = `
                <td style="padding: 0.6rem 0; font-size: 0.8rem;"><strong>TOTAL PLAN ESTIMATE</strong></td>
                <td style="padding: 0.6rem 0; font-size: 0.8rem;"><strong>Complete House</strong></td>
                <td style="padding: 0.6rem 0; font-size: 0.85rem; text-align: right; color: var(--sky-700);"><strong>₱${finalTotalPriceVal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></td>
            `;
            printMaterialsTableBody.appendChild(totalTr);
        }

        // Open Modal Display
        if (sysExportModal) sysExportModal.style.display = 'flex';
    }

    // Lightbox modal functionality
    const imageLightbox = document.getElementById('imageLightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const btnCloseLightbox = document.getElementById('btnCloseLightbox');

    if (step2HouseImg) {
        step2HouseImg.addEventListener('click', () => {
            const house = state.houses[state.activeHouse];
            if (house) {
                openLightbox(house.img, `${house.name} - AI Render`);
            }
        });
    }

    if (step2BlueprintImg) {
        step2BlueprintImg.addEventListener('click', () => {
            const house = state.houses[state.activeHouse];
            if (house) {
                openLightbox(house.blueprint, `${house.name} - Technical Blueprint Plan`);
            }
        });
    }

    function openLightbox(src, caption) {
        if (!imageLightbox || !lightboxImg) return;
        lightboxImg.src = src;
        if (lightboxCaption) lightboxCaption.innerText = caption;
        imageLightbox.style.display = 'flex';
        setTimeout(() => {
            imageLightbox.style.opacity = '1';
            lightboxImg.style.transform = 'scale(1)';
        }, 50);
    }

    function closeLightbox() {
        if (!imageLightbox) return;
        imageLightbox.style.opacity = '0';
        if (lightboxImg) lightboxImg.style.transform = 'scale(0.95)';
        setTimeout(() => {
            imageLightbox.style.display = 'none';
        }, 300);
    }

    if (btnCloseLightbox) {
        btnCloseLightbox.addEventListener('click', closeLightbox);
    }

    if (imageLightbox) {
        imageLightbox.addEventListener('click', (e) => {
            if (e.target === imageLightbox) {
                closeLightbox();
            }
        });
    }

    // -------------------------------------------------------------
    // INTERACTIVE SVG REGIONAL GIS MAP DRAWING
    // -------------------------------------------------------------
    const MAP_COORDS = {
        davao_norte: {
            panabo: {
                san_vicente: { x: 120, y: 75, lat: "7.3075° N", lon: "125.6853° E" },
                gredu: { x: 115, y: 78, lat: "7.2995° N", lon: "125.6800° E" },
                new_pandan: { x: 112, y: 82, lat: "7.2882° N", lon: "125.6720° E" },
                quezon: { x: 108, y: 70, lat: "7.3150° N", lon: "125.6601° E" }
            },
            tagum: {
                apokon: { x: 180, y: 60, lat: "7.4421° N", lon: "125.8202° E" },
                mankilam: { x: 172, y: 54, lat: "7.4582° N", lon: "125.7955° E" },
                visayan_village: { x: 184, y: 52, lat: "7.4611° N", lon: "125.8115° E" },
                magugpo_west: { x: 168, y: 58, lat: "7.4390° N", lon: "125.7890° E" }
            },
            samal: {
                babak: { x: 146, y: 102, lat: "7.1180° N", lon: "125.7320° E" },
                penaplata: { x: 142, y: 112, lat: "7.0650° N", lon: "125.7110° E" },
                kaputian: { x: 138, y: 124, lat: "6.9850° N", lon: "125.6980° E" },
                villarica: { x: 148, y: 118, lat: "7.0420° N", lon: "125.7410° E" }
            },
            carmen: {
                ising: { x: 95, y: 70, lat: "7.3625° N", lon: "125.6983° E" },
                alejal: { x: 91, y: 74, lat: "7.3501° N", lon: "125.6880° E" },
                magsaysay: { x: 88, y: 78, lat: "7.3392° N", lon: "125.6750° E" },
                tuganay: { x: 93, y: 66, lat: "7.3780° N", lon: "125.7090° E" }
            },
            sto_tomas: {
                tibal_on: { x: 74, y: 44, lat: "7.5256° N", lon: "125.6369° E" },
                kimamon: { x: 70, y: 48, lat: "7.5110° N", lon: "125.6210° E" },
                san_miguel: { x: 78, y: 40, lat: "7.5420° N", lon: "125.6520° E" },
                new_visayas: { x: 82, y: 46, lat: "7.5190° N", lon: "125.6410° E" }
            }
        },
        davao_sur: {
            davao_city: {
                buhangin: { x: 130, y: 65, lat: "7.0736° N", lon: "125.6110° E" },
                talomo: { x: 115, y: 80, lat: "7.0220° N", lon: "125.5640° E" },
                agdao: { x: 138, y: 70, lat: "7.0850° N", lon: "125.6310° E" },
                toril: { x: 95, y: 105, lat: "6.9690° N", lon: "125.4980° E" },
                bajada: { x: 135, y: 72, lat: "7.0790° N", lon: "125.6180° E" }
            },
            digos: {
                tres_de_mayo: { x: 65, y: 120, lat: "6.7578° N", lon: "125.3556° E" },
                zone_1: { x: 60, y: 124, lat: "6.7450° N", lon: "125.3420° E" },
                matti: { x: 55, y: 116, lat: "6.7820° N", lon: "125.3190° E" },
                colorado: { x: 70, y: 112, lat: "6.7910° N", lon: "125.3810° E" }
            }
        },
        leyte: {
            tacloban: {
                anibong: { x: 170, y: 50, lat: "11.2444° N", lon: "125.0039° E" },
                diit: { x: 162, y: 45, lat: "11.2680° N", lon: "124.9780° E" },
                san_jose: { x: 180, y: 62, lat: "11.2050° N", lon: "125.0180° E" },
                marasbaras: { x: 172, y: 58, lat: "11.2180° N", lon: "124.9920° E" }
            },
            ormoc: {
                valencia: { x: 85, y: 90, lat: "11.0050° N", lon: "124.6078° E" },
                cogon: { x: 80, y: 94, lat: "10.9910° N", lon: "124.5910° E" },
                can_adieng: { x: 74, y: 98, lat: "10.9810° N", lon: "124.5750° E" },
                linao: { x: 88, y: 86, lat: "11.0250° N", lon: "124.6290° E" }
            }
        }
    };

    function drawInteractiveMap(provKey, cityKey, bKey) {
        if (!gisMapSvg) return;
        
        // Get coordinate details
        const pCoords = MAP_COORDS[provKey];
        if (!pCoords) return;
        const cCoords = pCoords[cityKey];
        if (!cCoords) return;
        const bCoords = cCoords[bKey];
        if (!bCoords) return;

        // Update Coordinates Display Label
        if (gisMapCoords) {
            gisMapCoords.innerText = `LAT: ${bCoords.lat} | LON: ${bCoords.lon}`;
        }

        // Get the active risk color based on data
        const provData = LOCATIONS[provKey];
        const cityData = provData.cities[cityKey];
        const bData = cityData.barangays[bKey];
        let pinColor = 'var(--green-500)';
        const riskText = bData.risk.toUpperCase();
        if (riskText.includes('HIGH')) {
            pinColor = '#ef4444';
        } else if (riskText.includes('MODERATE')) {
            pinColor = 'var(--orange-500)';
        }

        let mapContent = '';

        // Dynamic gradient and filter patterns
        mapContent += `
        <defs>
            <filter id="glow-effect" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="gridGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.03" />
                <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.12" />
            </linearGradient>
            <linearGradient id="landGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#0284c7" stop-opacity="0.15" />
                <stop offset="50%" stop-color="#0369a1" stop-opacity="0.25" />
                <stop offset="100%" stop-color="#0c4a6e" stop-opacity="0.1" />
            </linearGradient>
        </defs>
        `;

        // Background Cyber-Grid with Crosshair layout
        mapContent += `
        <rect width="300" height="150" fill="url(#gridGradient)" />
        <g stroke="rgba(56, 189, 248, 0.08)" stroke-width="1">
            <line x1="50" y1="0" x2="50" y2="150" />
            <line x1="100" y1="0" x2="100" y2="150" />
            <line x1="150" y1="0" x2="150" y2="150" />
            <line x1="200" y1="0" x2="200" y2="150" />
            <line x1="250" y1="0" x2="250" y2="150" />
            <line x1="0" y1="30" x2="300" y2="30" />
            <line x1="0" y1="60" x2="300" y2="60" />
            <line x1="0" y1="90" x2="300" y2="90" />
            <line x1="0" y1="120" x2="300" y2="120" />
        </g>
        <rect x="5" y="5" width="290" height="140" fill="none" stroke="rgba(56, 189, 248, 0.15)" stroke-width="1" rx="4" />
        <path d="M 8 15 L 8 8 L 15 8" stroke="#38bdf8" stroke-width="1.5" fill="none" opacity="0.6" />
        <path d="M 292 15 L 292 8 L 285 8" stroke="#38bdf8" stroke-width="1.5" fill="none" opacity="0.6" />
        <path d="M 8 135 L 8 142 L 15 142" stroke="#38bdf8" stroke-width="1.5" fill="none" opacity="0.6" />
        <path d="M 292 135 L 292 142 L 285 142" stroke="#38bdf8" stroke-width="1.5" fill="none" opacity="0.6" />
        `;

        // Render distinct premium vector geographic designs per province
        if (provKey === 'davao_norte') {
            mapContent += `
            <path d="M 50 15 Q 120 10 180 30 T 230 60 Q 200 90 170 100 T 110 80 Q 70 80 50 15 Z" 
                  fill="url(#landGradient)" stroke="#0284c7" stroke-width="1.8" filter="url(#glow-effect)" />
            <path d="M 134 102 Q 155 92 155 115 T 138 128 Z" 
                  fill="url(#landGradient)" stroke="#0ea5e9" stroke-width="1.5" />
            <path d="M 160 120 C 170 122 180 120 190 122" stroke="rgba(56,189,248,0.15)" stroke-width="1" fill="none" />
            <path d="M 165 125 C 172 127 178 125 185 127" stroke="rgba(56,189,248,0.15)" stroke-width="1" fill="none" />
            
            <text x="35" y="32" fill="#e0f2fe" opacity="0.75" font-size="9" font-family="var(--font-heading)" font-weight="700" letter-spacing="1">DAVAO DEL NORTE</text>
            <text x="146" y="137" fill="#38bdf8" opacity="0.7" font-size="7" font-family="monospace">SAMAL ISLAND</text>
            <text x="210" y="110" fill="#38bdf8" opacity="0.4" font-size="8" font-style="italic">Davao Gulf</text>
            `;
        } else if (provKey === 'davao_sur') {
            mapContent += `
            <path d="M 50 20 Q 140 10 160 50 T 140 110 Q 110 130 90 135 T 50 90 Q 30 50 50 20 Z" 
                  fill="url(#landGradient)" stroke="#0284c7" stroke-width="1.8" filter="url(#glow-effect)" />
            <path d="M 165 85 C 175 87 185 85 195 87" stroke="rgba(56,189,248,0.15)" stroke-width="1" fill="none" />
            <path d="M 170 92 C 177 94 184 92 191 94" stroke="rgba(56,189,248,0.15)" stroke-width="1" fill="none" />

            <text x="35" y="32" fill="#e0f2fe" opacity="0.75" font-size="9" font-family="var(--font-heading)" font-weight="700" letter-spacing="1">DAVAO DEL SUR</text>
            <text x="110" y="65" fill="#38bdf8" opacity="0.7" font-size="7.5" font-family="monospace">DAVAO CITY</text>
            <text x="180" y="75" fill="#38bdf8" opacity="0.4" font-size="8" font-style="italic">Davao Gulf</text>
            `;
        } else if (provKey === 'leyte') {
            mapContent += `
            <path d="M 60 120 Q 90 110 120 70 T 180 30 Q 195 20 205 35 T 160 85 Q 120 115 95 135 Z" 
                  fill="url(#landGradient)" stroke="#0284c7" stroke-width="1.8" filter="url(#glow-effect)" />
            <path d="M 210 65 C 220 67 230 65 240 67" stroke="rgba(56,189,248,0.15)" stroke-width="1" fill="none" />
            <path d="M 215 71 C 222 73 229 71 236 73" stroke="rgba(56,189,248,0.15)" stroke-width="1" fill="none" />

            <text x="35" y="32" fill="#e0f2fe" opacity="0.75" font-size="9" font-family="var(--font-heading)" font-weight="700" letter-spacing="1">LEYTE ISLAND</text>
            <text x="185" y="55" fill="#38bdf8" opacity="0.7" font-size="7" font-family="monospace">TACLOBAN</text>
            <text x="62" y="85" fill="#38bdf8" opacity="0.7" font-size="7" font-family="monospace">ORMOC</text>
            <text x="210" y="105" fill="#38bdf8" opacity="0.4" font-size="8" font-style="italic">San Juanico</text>
            `;
        }

        // Radar Pin Group
        mapContent += `
        <g class="map-pin-group" transform="translate(${bCoords.x}, ${bCoords.y})">
            <!-- Ripple Wave 1 -->
            <circle r="12" fill="none" stroke="${pinColor}" stroke-width="1.5" opacity="0.8">
                <animate attributeName="r" values="4;18" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0" dur="2s" repeatCount="indefinite" />
            </circle>
            <!-- Ripple Wave 2 -->
            <circle r="18" fill="none" stroke="${pinColor}" stroke-width="1" opacity="0.4">
                <animate attributeName="r" values="8;26" dur="2s" begin="0.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0" dur="2s" begin="0.5s" repeatCount="indefinite" />
            </circle>
            <!-- Glow dot center -->
            <circle r="5.5" fill="${pinColor}" stroke="#ffffff" stroke-width="1.5" style="filter: drop-shadow(0 0 3px ${pinColor});" />
            
            <!-- Dynamic flag frame with active Barangay name -->
            <rect x="8" y="-12" width="75" height="15" fill="rgba(11, 19, 41, 0.85)" stroke="rgba(56, 189, 248, 0.4)" stroke-width="1" rx="2" />
            <text x="12" y="-2" fill="#ffffff" font-size="6.5" font-family="var(--font-heading)" font-weight="700">${bData.name}</text>
        </g>
        `;

        gisMapSvg.innerHTML = mapContent;
    }

    // Initialize application logic
    init();
});
