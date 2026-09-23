/**
 * Progresso Building Planning & Estimation Engine
 * Core Logic for Automated suggestions, materials breakdown, interactive timeline, and sandbox calibrator.
 */

document.addEventListener('DOMContentLoaded', () => {
    // STATE DATA OBJECT
    const state = {
        unit: 'sqm', // 'sqm' or 'sqft'
        area: 60,
        floors: 1,
        bedrooms: 2,
        bathrooms: 1,
        quality: 'standard', // 'standard', 'premium', 'luxury'
        roofType: 'gable', // 'gable', 'flat', 'hip'
        
        // Sandbox Materials unit prices in Philippine Pesos (₱) - Defaults
        rates: {
            cement: 280.00,    // per bag PHP
            steel: 75.00,     // per kg PHP
            bricks: 15.00,    // per pc PHP (CHB)
            sand: 1500.00,    // per m³ PHP
            roof: 450.00,     // per m² PHP
            paint: 250.00,    // per liter PHP
            tiles: 350.00,    // per m² PHP
            fixtures: 4500.00, // base rate per package unit PHP
            wood: 80.00,       // per board foot PHP
            floormat: 120.00   // per m² PHP
        },

        // Scope exclusions
        scope: {
            roof: true,
            finishes: true,
            utilities: true
        },

        // Labor configurations (Philippines)
        laborRate: 650,      // daily rate per worker PHP (carpenter/mason average)
        crewSize: 8,         // workers in crew
        
        // Simulation Progress
        progress: 100,         // 0% to 100%

        // Active suggestions catalog
        suggestions: [],

        // Rooms drag coordinates
        rooms: null,
        lastLayoutKey: '',
        userManagedRooms: false, // becomes true when user manually adds/deletes rooms
        
        deletedMaterials: [],
        customQuantities: {},

        // Phase overrides: { phaseId: true/false } where true = complete (100%), false = incomplete (0%)
        phaseOverrides: {}
    };

    // DOM ELEMENTS - Inputs
    const areaRange = document.getElementById('areaRange');
    const areaInput = document.getElementById('areaInput');
    const areaBadge = document.getElementById('areaBadge');
    const areaSuffix = document.getElementById('areaSuffix');
    const btnSqm = document.getElementById('btnSqm');
    const btnSqft = document.getElementById('btnSqft'); // null in metric-only mode
    
    const floorBtns = document.querySelectorAll('.floor-btn');
    
    const bedroomInput = document.getElementById('bedroomInput');
    const minusBed = document.getElementById('minusBed');
    const plusBed = document.getElementById('plusBed');
    
    const bathroomInput = document.getElementById('bathroomInput');
    const minusBath = document.getElementById('minusBath');
    const plusBath = document.getElementById('plusBath');
    
    const qualityRadios = document.querySelectorAll('input[name="quality"]');
    const qualityOptions = document.querySelectorAll('.quality-option');
    const roofSelect = document.getElementById('roofSelect');

    // DOM ELEMENTS - Tabs
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    // DOM ELEMENTS - Sandbox Inputs
    const rateCement = document.getElementById('rateCement');
    const rateSteel = document.getElementById('rateSteel');
    const rateBricks = document.getElementById('rateBricks');
    const rateSand = document.getElementById('rateSand');
    const rateRoof = document.getElementById('rateRoof');
    const ratePaint = document.getElementById('ratePaint');
    const rateTiles = document.getElementById('rateTiles');
    const rateUtilities = document.getElementById('rateUtilities');
    const rateWood = document.getElementById('rateWood');
    const rateFloorMat = document.getElementById('rateFloorMat');
    const btnRestoreMaterials = document.getElementById('btnRestoreMaterials');

    const laborRateInput = document.getElementById('laborRateInput');
    const laborRateVal = document.getElementById('laborRateVal');
    const crewSizeInput = document.getElementById('crewSizeInput');
    const crewSizeVal = document.getElementById('crewSizeVal');

    const includeRoofScope = document.getElementById('includeRoofScope');
    const includeFinishesScope = document.getElementById('includeFinishesScope');
    const includeUtilitiesScope = document.getElementById('includeUtilitiesScope');
    const btnResetSandbox = document.getElementById('btnResetSandbox');

    // DOM ELEMENTS - Table & Search
    const materialSearch = document.getElementById('materialSearch');
    const materialTableBody = document.getElementById('materialTableBody');
    const filterBtns = document.querySelectorAll('.filter-btn');

    // DOM ELEMENTS - Live Summary Widget
    const summaryCost = document.getElementById('summaryCost');
    const summaryCostPerSqm = document.getElementById('summaryCostPerSqm');
    const summaryTime = document.getElementById('summaryTime');
    const summaryDays = document.getElementById('summaryDays');
    const summaryQuality = document.getElementById('summaryQuality');
    const summaryFloors = document.getElementById('summaryFloors');
    const overallProgressText = document.getElementById('overallProgressText');
    const overallProgressBar = document.getElementById('overallProgressBar');

    // DOM ELEMENTS - Materials tab widgets
    const matTotalVal = document.getElementById('matTotalVal');
    const laborTotalVal = document.getElementById('laborTotalVal');
    const overheadTotalVal = document.getElementById('overheadTotalVal');

    // DOM ELEMENTS - Timeline tab
    const progressSimulateSlider = document.getElementById('progressSimulateSlider');
    const progressSliderLabel = document.getElementById('progressSliderLabel');
    const ganttContainer = document.getElementById('ganttContainer');
    const phaseTimelineList = document.getElementById('phaseTimelineList');

    // DOM ELEMENTS - Export PDF Report Modal
    const exportPdfBtn = document.getElementById('exportPdfBtn');
    const exportModal = document.getElementById('exportModal');
    const btnCloseExportModal = document.getElementById('btnCloseExportModal');
    const btnPrintActual = document.getElementById('btnPrintActual');
    const printDateString = document.getElementById('printDateString');
    
    // Modal Table & Info targets
    const pArea = document.getElementById('pArea');
    const pFloors = document.getElementById('pFloors');
    const pBedrooms = document.getElementById('pBedrooms');
    const pBathrooms = document.getElementById('pBathrooms');
    const pQuality = document.getElementById('pQuality');
    const pRoof = document.getElementById('pRoof');
    const pMatCost = document.getElementById('pMatCost');
    const pLaborCost = document.getElementById('pLaborCost');
    const pDuration = document.getElementById('pDuration');
    const pTotalCost = document.getElementById('pTotalCost');
    const pMaterialGrid = document.querySelector('#pMaterialGrid tbody');
    const pTimelineGrid = document.querySelector('#pTimelineGrid tbody');

    // Suggestions container
    const suggestionsGrid = document.getElementById('suggestionsGrid');

    // Blueprint SVG
    const blueprintSvg = document.getElementById('blueprintSvg');

    // Drag-and-drop state variables
    let activeDragRoomIdx = null;
    let dragStartX = 0;
    let dragStartY = 0;
    let roomStartX = 0;
    let roomStartY = 0;

    // Helper: Screen to SVG coordinates mapping
    function getSVGCoords(evt) {
        const pt = blueprintSvg.createSVGPoint();
        if (evt.touches && evt.touches[0]) {
            pt.x = evt.touches[0].clientX;
            pt.y = evt.touches[0].clientY;
        } else {
            pt.x = evt.clientX;
            pt.y = evt.clientY;
        }
        return pt.matrixTransform(blueprintSvg.getScreenCTM().inverse());
    }

    // Drag start handler
    function startDrag(e) {
        const idx = parseInt(this.getAttribute('data-idx'));
        if (isNaN(idx)) return;
        activeDragRoomIdx = idx;
        
        const coords = getSVGCoords(e);
        const room = state.rooms[idx];
        
        dragStartX = coords.x;
        dragStartY = coords.y;
        roomStartX = room.x;
        roomStartY = room.y;
        
        this.setAttribute('style', 'cursor: grabbing; transition: none;');
    }

    // Drag move handler
    function dragMove(e) {
        if (activeDragRoomIdx === null) return;
        
        const coords = getSVGCoords(e);
        const dx = coords.x - dragStartX;
        const dy = coords.y - dragStartY;
        
        const room = state.rooms[activeDragRoomIdx];
        let newX = roomStartX + dx;
        let newY = roomStartY + dy;
        
        // Boundaries clamping inside the entire 600x400 canvas
        const minX = 0;
        const maxX = 600 - room.w;
        const minY = 0;
        const maxY = 400 - room.h;
        
        if (newX < minX) newX = minX;
        if (newX > maxX) newX = maxX;
        if (newY < minY) newY = minY;
        if (newY > maxY) newY = maxY;
        
        room.x = newX;
        room.y = newY;
        
        // Re-render SVG elements positions in DOM directly (smooth dragging!)
        const roomGroup = blueprintSvg.querySelector(`.draggable-room-group[data-idx="${activeDragRoomIdx}"]`);
        if (roomGroup) {
            // Update rectangles
            const rects = roomGroup.querySelectorAll('rect');
            rects.forEach(r => {
                r.setAttribute('x', newX);
                r.setAttribute('y', newY);
            });
            // Update text group translation
            const textGroup = roomGroup.querySelector('.room-text-group');
            if (textGroup) {
                textGroup.setAttribute('transform', `translate(${newX + room.w / 2}, ${newY + room.h / 2})`);
            }
            // Update rotate button
            const rotIcon = roomGroup.querySelector('.room-rotate-icon');
            if (rotIcon) {
                rotIcon.setAttribute('transform', `translate(${newX + room.w - 20}, ${newY + 4})`);
            }
        }
    }

    // Drag end handler
    function dragEnd(e) {
        if (activeDragRoomIdx !== null) {
            const roomGroup = blueprintSvg.querySelector(`.draggable-room-group[data-idx="${activeDragRoomIdx}"]`);
            if (roomGroup) {
                roomGroup.setAttribute('style', 'cursor: grab;');
            }
            activeDragRoomIdx = null;
        }
    }

    // -------------------------------------------------------------
    // INITIALIZATION & TAB SWITCHING
    // -------------------------------------------------------------
    function init() {
        // Tab setup
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                tabPanes.forEach(p => p.classList.remove('active'));
                
                btn.classList.add('active');
                const targetPane = document.getElementById(btn.dataset.tab);
                if (targetPane) targetPane.classList.add('active');
            });
        });

        // Search and filter in Material table
        materialSearch.addEventListener('input', renderMaterialTable);
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderMaterialTable();
            });
        });

        // Setup event listeners
        bindEvents();
        
        // Initial Calculation
        calculateEverything();
    }

    // -------------------------------------------------------------
    // BIND INPUT EVENTS
    // -------------------------------------------------------------
    function bindEvents() {
        // Area conversion handling
        if (btnSqm) btnSqm.addEventListener('click', () => setUnit('sqm'));
        if (btnSqft) btnSqft.addEventListener('click', () => setUnit('sqft'));

        // Area slider/input sync
        areaRange.addEventListener('input', (e) => {
            state.area = parseFloat(e.target.value);
            areaInput.value = state.area;
            calculateEverything();
        });

        areaInput.addEventListener('change', (e) => {
            let val = parseFloat(e.target.value);
            if (isNaN(val)) val = 60;
            if (val < areaRange.min) val = parseFloat(areaRange.min);
            if (val > areaRange.max) val = parseFloat(areaRange.max);
            state.area = val;
            areaRange.value = val;
            areaInput.value = val;
            calculateEverything();
        });

        // Floor selector
        floorBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                floorBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.floors = parseInt(btn.dataset.floors);
                calculateEverything();
            });
        });

        // Bed/Bath Counters (now hidden inputs - just update state directly from rooms)
        if (minusBed) minusBed.addEventListener('click', () => adjustCounter('bedroom', -1));
        if (plusBed) plusBed.addEventListener('click', () => adjustCounter('bedroom', 1));
        if (minusBath) minusBath.addEventListener('click', () => adjustCounter('bathroom', -1));
        if (plusBath) plusBath.addEventListener('click', () => adjustCounter('bathroom', 1));

        // Roof description updater
        roofSelect.addEventListener('change', (e) => {
            state.roofType = e.target.value;
            updateRoofDescription(e.target.value);
            calculateEverything();
        });
        updateRoofDescription(state.roofType);

        // Quality radios
        qualityOptions.forEach(opt => {
            const radio = opt.querySelector('input[type="radio"]');
            opt.addEventListener('click', () => {
                qualityOptions.forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
                radio.checked = true;
                state.quality = radio.value;
                calculateEverything();
            });
        });

        // Sandbox Rate Inputs
        const bindSandboxRate = (inputEl, rateKey) => {
            inputEl.addEventListener('change', (e) => {
                let val = parseFloat(e.target.value);
                if (isNaN(val) || val <= 0) val = 1.0;
                state.rates[rateKey] = val;
                inputEl.value = val.toFixed(2);
                calculateEverything();
            });
        };
        bindSandboxRate(rateCement, 'cement');
        bindSandboxRate(rateSteel, 'steel');
        bindSandboxRate(rateBricks, 'bricks');
        bindSandboxRate(rateSand, 'sand');
        bindSandboxRate(rateRoof, 'roof');
        bindSandboxRate(ratePaint, 'paint');
        bindSandboxRate(rateTiles, 'tiles');
        bindSandboxRate(rateUtilities, 'fixtures');
        bindSandboxRate(rateWood, 'wood');
        bindSandboxRate(rateFloorMat, 'floormat');

        // Sandbox Sliders
        laborRateInput.addEventListener('input', (e) => {
            state.laborRate = parseInt(e.target.value);
            laborRateVal.innerText = `₱${state.laborRate.toFixed(2)}/day`;
            calculateEverything();
        });

        crewSizeInput.addEventListener('input', (e) => {
            state.crewSize = parseInt(e.target.value);
            crewSizeVal.innerText = `${state.crewSize} members`;
            calculateEverything();
        });

        // Sandbox Scope Toggles
        includeRoofScope.addEventListener('change', (e) => {
            state.scope.roof = e.target.checked;
            calculateEverything();
        });
        includeFinishesScope.addEventListener('change', (e) => {
            state.scope.finishes = e.target.checked;
            calculateEverything();
        });
        includeUtilitiesScope.addEventListener('change', (e) => {
            state.scope.utilities = e.target.checked;
            calculateEverything();
        });

        // Reset Sandbox to Philippines rates
        btnResetSandbox.addEventListener('click', () => {
            state.rates = { cement: 280.00, steel: 75.00, bricks: 15.00, sand: 1500.00, roof: 450.00, paint: 250.00, tiles: 350.00, fixtures: 4500.00, wood: 80.00, floormat: 120.00 };
            state.laborRate = 650;
            state.crewSize = 8;
            state.scope = { roof: true, finishes: true, utilities: true };
            state.deletedMaterials = [];
            state.customQuantities = {};

            // Reset UI
            rateCement.value = "280.00";
            rateSteel.value = "75.00";
            rateBricks.value = "15.00";
            rateSand.value = "1500.00";
            rateRoof.value = "450.00";
            ratePaint.value = "250.00";
            rateTiles.value = "350.00";
            rateUtilities.value = "4500.00";
            rateWood.value = "80.00";
            rateFloorMat.value = "120.00";
            
            laborRateInput.value = 650;
            laborRateVal.innerText = "₱650.00/day";
            crewSizeInput.value = 8;
            crewSizeVal.innerText = "8 members";

            includeRoofScope.checked = true;
            includeFinishesScope.checked = true;
            includeUtilitiesScope.checked = true;

            calculateEverything();
        });

        // Restore all deleted materials
        if (btnRestoreMaterials) {
            btnRestoreMaterials.addEventListener('click', () => {
                state.deletedMaterials = [];
                calculateEverything();
            });
        }

        // Timeline slider simulation
        progressSimulateSlider.addEventListener('input', (e) => {
            state.progress = parseInt(e.target.value);
            progressSliderLabel.innerText = `${state.progress}% Complete`;
            overallProgressText.innerText = `${state.progress}%`;
            overallProgressBar.style.width = `${state.progress}%`;
            renderTimeline();
        });

        // Blueprint SVG drag handlers
        blueprintSvg.addEventListener('mousemove', dragMove);
        blueprintSvg.addEventListener('touchmove', dragMove, { passive: false });
        blueprintSvg.addEventListener('mouseup', dragEnd);
        blueprintSvg.addEventListener('mouseleave', dragEnd);
        blueprintSvg.addEventListener('touchend', dragEnd);

        // Room manager action buttons
        const addBedBtn = document.getElementById('btnAddBed');
        const addBathBtn = document.getElementById('btnAddingBath');
        const addLivingBtn = document.getElementById('btnAddLiving');
        const addKitchenBtn = document.getElementById('btnAddKitchen');
        const addPathBtn = document.getElementById('btnAddPath');

        if (addBedBtn) {
            addBedBtn.addEventListener('click', () => {
                if (!state.rooms) state.rooms = [];
                state.userManagedRooms = true;
                const id = 'r_' + Date.now();
                state.rooms.push({
                    id: id,
                    name: `Bedroom ${state.rooms.filter(r => r.type === 'bed').length + 1}`,
                    type: 'bed',
                    wMeters: 4.0,
                    hMeters: 3.5,
                    x: 15,
                    y: 15
                });
                calculateEverything();
            });
        }

        if (addBathBtn) {
            addBathBtn.addEventListener('click', () => {
                if (!state.rooms) state.rooms = [];
                state.userManagedRooms = true;
                const id = 'r_' + Date.now();
                state.rooms.push({
                    id: id,
                    name: `Bathroom ${state.rooms.filter(r => r.type === 'bath').length + 1}`,
                    type: 'bath',
                    wMeters: 2.5,
                    hMeters: 2.0,
                    x: 15,
                    y: 85
                });
                calculateEverything();
            });
        }

        if (addLivingBtn) {
            addLivingBtn.addEventListener('click', () => {
                if (!state.rooms) state.rooms = [];
                state.userManagedRooms = true;
                const id = 'r_' + Date.now();
                state.rooms.push({
                    id: id,
                    name: `Living Room ${state.rooms.filter(r => r.type === 'living').length + 1}`,
                    type: 'living',
                    wMeters: 5.5,
                    hMeters: 4.5,
                    x: 15,
                    y: 155
                });
                calculateEverything();
            });
        }

        if (addKitchenBtn) {
            addKitchenBtn.addEventListener('click', () => {
                if (!state.rooms) state.rooms = [];
                state.userManagedRooms = true;
                const id = 'r_' + Date.now();
                state.rooms.push({
                    id: id,
                    name: `Kitchen ${state.rooms.filter(r => r.type === 'kitchen').length + 1}`,
                    type: 'kitchen',
                    wMeters: 4.0,
                    hMeters: 3.0,
                    x: 15,
                    y: 225
                });
                calculateEverything();
            });
        }

        if (addPathBtn) {
            addPathBtn.addEventListener('click', () => {
                if (!state.rooms) state.rooms = [];
                state.userManagedRooms = true;
                const id = 'r_' + Date.now();
                state.rooms.push({
                    id: id,
                    name: `Hallway ${state.rooms.filter(r => r.type === 'path').length + 1}`,
                    type: 'path',
                    wMeters: 1.5,
                    hMeters: 4.0,
                    x: 15,
                    y: 295
                });
                calculateEverything();
            });
        }

        const addStairsBtn = document.getElementById('btnAddStairs');
        if (addStairsBtn) {
            addStairsBtn.addEventListener('click', () => {
                if (!state.rooms) state.rooms = [];
                state.userManagedRooms = true;
                const id = 'r_' + Date.now();
                state.rooms.push({
                    id: id,
                    name: `Stairs ${state.rooms.filter(r => r.type === 'stairs').length + 1}`,
                    type: 'stairs',
                    wMeters: 1.5,
                    hMeters: 3.0,
                    x: 15,
                    y: 350
                });
                calculateEverything();
            });
        }

        // Print Prospectus Actions
        exportPdfBtn.addEventListener('click', openExportModal);
        btnCloseExportModal.addEventListener('click', () => exportModal.classList.remove('active'));
        btnPrintActual.addEventListener('click', () => window.print());
        window.addEventListener('click', (e) => {
            if (e.target === exportModal) exportModal.classList.remove('active');
        });
    }

    // Adjust counters for Bedroom/Bathroom
    function adjustCounter(type, change) {
        if (type === 'bedroom') {
            let val = parseInt(bedroomInput.value) + change;
            if (val >= 1 && val <= 10) {
                bedroomInput.value = val;
                state.bedrooms = val;
                calculateEverything();
            }
        } else if (type === 'bathroom') {
            let val = parseInt(bathroomInput.value) + change;
            if (val >= 1 && val <= 8) {
                bathroomInput.value = val;
                state.bathrooms = val;
                calculateEverything();
            }
        }
    }

    // Set Unit System (sqm vs sqft)
    function setUnit(u) {
        if (state.unit === u) return;
        state.unit = u;

        if (u === 'sqm') {
            if (btnSqm) btnSqm.classList.add('active');
            if (btnSqft) btnSqft.classList.remove('active');
            if (areaSuffix) areaSuffix.innerText = 'm²';
            
            // convert state.area from sqft to sqm
            state.area = Math.round(state.area / 10.764);
            if (state.area < 20) state.area = 20;
            if (state.area > 500) state.area = 500;
        } else {
            if (btnSqft) btnSqft.classList.add('active');
            if (btnSqm) btnSqm.classList.remove('active');
            if (areaSuffix) areaSuffix.innerText = 'sq ft';
            
            // convert state.area from sqm to sqft
            state.area = Math.round(state.area * 10.764);
            if (state.area < 200) state.area = 200;
            if (state.area > 5000) state.area = 5000;
        }

        // Adjust input ranges accordingly
        if (areaRange) {
            if (u === 'sqm') {
                areaRange.min = 20;
                areaRange.max = 500;
            } else {
                areaRange.min = 200;
                areaRange.max = 5000;
            }
            areaRange.value = state.area;
        }

        if (areaInput) areaInput.value = state.area;
        calculateEverything();
    }

    // -------------------------------------------------------------
    // AUTOMATED SYSTEM MATH ENGINE (Philippine Rates & No Profit Markup)
    // -------------------------------------------------------------
    let calculatedMaterials = [];
    let calculations = {
        materialCost: 0,
        laborCost: 0,
        totalCost: 0,
        durationWeeks: 0,
        durationDays: 0
    };

    // -------------------------------------------------------------
    // INTERACTIVE ROOM BUILDER LIST
    // -------------------------------------------------------------
    function renderBuilderRoomList() {
        const listBody = document.getElementById('builderRoomsList');
        if (!listBody) return;
        
        listBody.innerHTML = '';
        if (!state.rooms || state.rooms.length === 0) {
            listBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--slate-500); padding: 1.5rem;">No rooms added. Add some above!</td></tr>';
            return;
        }

        state.rooms.forEach((r, idx) => {
            const tr = document.createElement('tr');
            const badgeClass = r.type;
            const badgeLabel = r.type.toUpperCase();

            tr.innerHTML = `
                <td>
                    <div style="display: flex; align-items: center; gap: 0.6rem;">
                        <span class="table-category-badge ${badgeClass}">${badgeLabel}</span>
                        <input type="text" class="room-name-input" data-idx="${idx}" value="${r.name}" style="border: 1px solid var(--sky-200); border-radius: var(--radius-sm); padding: 0.25rem 0.5rem; font-size: 0.85rem; font-weight: 600; width: 130px; color: var(--slate-800); outline: none;">
                    </div>
                </td>
                <td style="text-align: center;">
                    <input type="number" class="dim-direct-input width-direct" data-idx="${idx}" value="${r.wMeters.toFixed(1)}" min="0.5" max="25" step="0.1"
                        style="width: 70px; border: 2px solid var(--sky-200); border-radius: var(--radius-sm); padding: 0.3rem 0.4rem; text-align: center; font-weight: 700; font-size: 0.9rem; color: var(--slate-800); outline: none; background: white;">
                    <span style="font-size: 0.8rem; font-weight: 600; color: var(--slate-500);">m</span>
                </td>
                <td style="text-align: center;">
                    <input type="number" class="dim-direct-input height-direct" data-idx="${idx}" value="${r.hMeters.toFixed(1)}" min="0.5" max="25" step="0.1"
                        style="width: 70px; border: 2px solid var(--sky-200); border-radius: var(--radius-sm); padding: 0.3rem 0.4rem; text-align: center; font-weight: 700; font-size: 0.9rem; color: var(--slate-800); outline: none; background: white;">
                    <span style="font-size: 0.8rem; font-weight: 600; color: var(--slate-500);">m</span>
                </td>
                <td>
                    <strong style="color: var(--slate-800); font-family: var(--font-heading);">${(r.wMeters * r.hMeters).toFixed(1)} m²</strong>
                </td>
                <td class="text-right">
                    <button class="rotate-room-btn" data-idx="${idx}" style="background: rgba(14, 165, 233, 0.08); color: var(--sky-700); border: 1px solid rgba(14, 165, 233, 0.15); padding: 0.35rem 0.75rem; border-radius: var(--radius-sm); cursor: pointer; font-size: 0.8rem; font-weight: 700; transition: var(--transition-quick); margin-right: 0.4rem;" title="Rotate Room 90 deg"><i class="fa-solid fa-rotate"></i> Rotate</button>
                    <button class="delete-room-btn" data-idx="${idx}" style="background: rgba(239, 68, 68, 0.08); color: #dc2626; border: 1px solid rgba(239, 68, 68, 0.15); padding: 0.35rem 0.75rem; border-radius: var(--radius-sm); cursor: pointer; font-size: 0.8rem; font-weight: 700; transition: var(--transition-quick);"><i class="fa-solid fa-trash"></i> Delete</button>
                </td>
            `;
            listBody.appendChild(tr);
        });

        // Bind event listeners for room list inputs
        listBody.querySelectorAll('.room-name-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const idx = parseInt(e.target.dataset.idx);
                state.rooms[idx].name = e.target.value;
                calculateEverything();
            });
        });

        // Direct number input for width
        listBody.querySelectorAll('.width-direct').forEach(input => {
            input.addEventListener('change', (e) => {
                const idx = parseInt(e.target.dataset.idx);
                let val = parseFloat(e.target.value);
                if (isNaN(val) || val < 0.5) val = 0.5;
                if (val > 25) val = 25;
                val = parseFloat(val.toFixed(1));
                state.rooms[idx].wMeters = val;
                e.target.value = val.toFixed(1);
                calculateEverything();
            });
        });

        // Direct number input for height
        listBody.querySelectorAll('.height-direct').forEach(input => {
            input.addEventListener('change', (e) => {
                const idx = parseInt(e.target.dataset.idx);
                let val = parseFloat(e.target.value);
                if (isNaN(val) || val < 0.5) val = 0.5;
                if (val > 25) val = 25;
                val = parseFloat(val.toFixed(1));
                state.rooms[idx].hMeters = val;
                e.target.value = val.toFixed(1);
                calculateEverything();
            });
        });

        // Rotate action
        listBody.querySelectorAll('.rotate-room-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const button = e.target.closest('.rotate-room-btn');
                const idx = parseInt(button.dataset.idx);
                const room = state.rooms[idx];
                const temp = room.wMeters;
                room.wMeters = room.hMeters;
                room.hMeters = temp;
                calculateEverything();
            });
        });

        // Delete action
        listBody.querySelectorAll('.delete-room-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const button = e.target.closest('.delete-room-btn');
                const idx = parseInt(button.dataset.idx);
                state.rooms.splice(idx, 1);
                state.userManagedRooms = true;
                calculateEverything();
            });
        });
    }

    function calculateEverything() {
        // Adjust badge area
        areaBadge.innerText = `${state.area} ${state.unit === 'sqm' ? 'm²' : 'sq ft'}`;
        document.querySelectorAll('.current-area-val').forEach(el => {
            el.innerText = `${state.area} ${state.unit === 'sqm' ? 'm²' : 'sq ft'}`;
        });

        // Standardize target area size to sqm
        const targetAreaInSqm = state.unit === 'sqm' ? state.area : (state.area / 10.764);

        // Standardize area size to sqm for calculation engine
        // If state.rooms has items, calculate the actual planned area sum!
        let areaInSqm = targetAreaInSqm;
        if (state.rooms && state.rooms.length > 0) {
            areaInSqm = state.rooms.reduce((sum, r) => sum + (r.wMeters * r.hMeters), 0);
            
            // Sync bedroom and bathroom counts from the rooms list
            state.bedrooms = state.rooms.filter(r => r.type === 'bed').length;
            state.bathrooms = state.rooms.filter(r => r.type === 'bath').length;
            bedroomInput.value = state.bedrooms;
            bathroomInput.value = state.bathrooms;
        }

        // Multipliers based on build specs quality
        let qFactor = 1.0;
        if (state.quality === 'premium') qFactor = 1.45;
        if (state.quality === 'luxury') qFactor = 2.10;

        // Stories / Floor multipliers
        const floorsMultiplier = 1.0 + (state.floors - 1) * 0.85;

        // Core Materials Estimation Logic (Set to 0 by default so user custom inputs the materials)
        const cementQty = 0;
        const steelQty = 0;
        const bricksQty = 0;
        const sandQty = 0;
        
        let roofQty = 0;
        const paintQty = 0;
        const tilesQty = 0;
        const fixturesQty = 0;

        // Build list of active materials with subtotals in PHP
        calculatedMaterials = [
            {
                id: 'cement',
                name: 'Portland Cement (General Purpose)',
                category: 'structural',
                qty: cementQty,
                unit: 'Bags',
                rate: state.rates.cement,
                subtotal: cementQty * state.rates.cement
            },
            {
                id: 'steel',
                name: 'Deformed Steel Bars (Rebars)',
                category: 'structural',
                qty: steelQty,
                unit: 'kg',
                rate: state.rates.steel,
                subtotal: steelQty * state.rates.steel
            },
            {
                id: 'bricks',
                name: 'Concrete Hollow Blocks (CHB)',
                category: 'structural',
                qty: bricksQty,
                unit: 'pcs',
                rate: state.rates.bricks,
                subtotal: bricksQty * state.rates.bricks
            },
            {
                id: 'sand',
                name: 'Coarse Sand & Aggregates',
                category: 'structural',
                qty: sandQty,
                unit: 'm³',
                rate: state.rates.sand,
                subtotal: sandQty * state.rates.sand
            },
            {
                id: 'wood',
                name: 'Structural Coco Lumber & Plywood (Wall Framing)',
                category: 'structural',
                qty: 0,
                unit: 'bd ft',
                rate: state.rates.wood,
                subtotal: 0
            }
        ];

        if (state.scope.roof && state.roofType !== 'flat') {
            calculatedMaterials.push({
                id: 'roof',
                name: state.roofType === 'hip' ? 'Premium Clay Roof Tiles' : 'Pre-painted G.I. Roof Sheets',
                category: 'structural',
                qty: roofQty,
                unit: 'm²',
                rate: state.rates.roof,
                subtotal: roofQty * state.rates.roof
            });
        }

        if (state.scope.finishes) {
            calculatedMaterials.push({
                id: 'paint',
                name: 'Boysen/Davies Premium Latex Paint',
                category: 'finishes',
                qty: paintQty,
                unit: 'Liters',
                rate: state.rates.paint,
                subtotal: paintQty * state.rates.paint
            });
            calculatedMaterials.push({
                id: 'tiles',
                name: 'Ceramic Floor & Wall Tiles',
                category: 'finishes',
                qty: tilesQty,
                unit: 'm²',
                rate: state.rates.tiles,
                subtotal: tilesQty * state.rates.tiles
            });
            calculatedMaterials.push({
                id: 'floormat',
                name: 'Premium Vinyl Floor Mat / Linoleum',
                category: 'finishes',
                qty: 0,
                unit: 'm²',
                rate: state.rates.floormat,
                subtotal: 0
            });
        }

        if (state.scope.utilities) {
            calculatedMaterials.push({
                id: 'fixtures',
                name: 'Plumbing & Electrical Fixtures Pack',
                category: 'utilities',
                qty: fixturesQty,
                unit: 'Sets',
                rate: state.rates.fixtures,
                subtotal: fixturesQty * state.rates.fixtures
            });
        }

        // Apply custom quantities overrides if defined
        calculatedMaterials.forEach(item => {
            if (state.customQuantities[item.id] !== undefined) {
                item.qty = state.customQuantities[item.id];
                item.subtotal = item.qty * item.rate;
            }
        });

        // Filter out deleted materials
        calculatedMaterials = calculatedMaterials.filter(item => !state.deletedMaterials.includes(item.id));

        // Sum materials cost
        calculations.materialCost = calculatedMaterials.reduce((acc, curr) => acc + curr.subtotal, 0);

        // Estimate Timeline duration automatically
        const totalManDays = areaInSqm * 4.2 * floorsMultiplier * qFactor;
        const rawDays = Math.ceil(totalManDays / state.crewSize);
        calculations.durationWeeks = Math.ceil(rawDays / 5);
        // Formula: (member x Day) x (Weeks) — total working days derived from weeks
        calculations.durationDays = calculations.durationWeeks * 5;

        // Calculate Labor Cost: crewSize × dailyRate × totalDays
        calculations.laborCost = state.crewSize * state.laborRate * calculations.durationDays;

        // Total Cost (Profit removed completely, pure materials + labor estimate)
        calculations.totalCost = calculations.materialCost + calculations.laborCost;

        // Render updates
        updateSummaryWidget(areaInSqm);
        renderMaterialTable();
        generateBuildingSuggestions(targetAreaInSqm);
        drawDynamicBlueprint(targetAreaInSqm);
        renderTimeline();
    }

    // -------------------------------------------------------------
    // RENDER LIVE DASHBOARD SUMMARY
    // -------------------------------------------------------------
    function updateSummaryWidget(areaInSqm) {
        // Calculate estimated completion date automatically
        const completionDate = new Date();
        completionDate.setDate(completionDate.getDate() + calculations.durationDays);
        const finishDateString = completionDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        summaryCost.innerText = `₱${calculations.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        
        let currentPlannedArea = areaInSqm;
        if (state.unit === 'sqft') {
            currentPlannedArea = areaInSqm * 10.764;
        }

        const costPerUnit = calculations.totalCost / currentPlannedArea;
        summaryCostPerSqm.innerText = `₱${costPerUnit.toFixed(2)} / ${state.unit === 'sqm' ? 'm²' : 'sq ft'}`;
        
        summaryTime.innerText = `${calculations.durationWeeks} Weeks`;
        summaryDays.innerText = `${calculations.durationDays} working days (Est. Finish: ${finishDateString})`;
        
        let qText = 'Standard Specs';
        if (state.quality === 'premium') qText = 'Premium Specs';
        if (state.quality === 'luxury') qText = 'Luxury Custom Specs';
        summaryQuality.innerText = qText;
        
        summaryFloors.innerText = `${state.floors} Floor${state.floors > 1 ? 's' : ''}`;
        
        // Top materials summaries in PHP
        matTotalVal.innerText = `₱${calculations.materialCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        laborTotalVal.innerText = `₱${calculations.laborCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        overheadTotalVal.innerText = `₱${calculations.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        // Update space allocation indicator
        const targetArea = state.unit === 'sqm' ? state.area : (state.area / 10.764);
        const allocatedPct = Math.round((areaInSqm / targetArea) * 100);
        
        const plannedAreaVal = document.getElementById('plannedAreaVal');
        if (plannedAreaVal) plannedAreaVal.innerText = `${areaInSqm.toFixed(1)} m²`;
        
        const allocatedPctText = document.getElementById('allocatedPctText');
        if (allocatedPctText) allocatedPctText.innerText = `${allocatedPct}%`;
        
        const allocatedProgressBar = document.getElementById('allocatedProgressBar');
        if (allocatedProgressBar) {
            allocatedProgressBar.style.width = `${Math.min(100, allocatedPct)}%`;
            if (allocatedPct > 100) {
                allocatedProgressBar.style.background = 'linear-gradient(90deg, #ef4444, #b91c1c)';
            } else {
                allocatedProgressBar.style.background = 'linear-gradient(90deg, var(--sky-400), var(--sky-600))';
            }
        }

        // Update overall project completion progress to be state.progress (always 100%)
        if (overallProgressText) overallProgressText.innerText = `${state.progress}%`;
        if (overallProgressBar) overallProgressBar.style.width = `${state.progress}%`;
    }

    // -------------------------------------------------------------
    // RENDER MATERIAL TABLE
    // -------------------------------------------------------------
    function renderMaterialTable() {
        const query = materialSearch.value.toLowerCase();
        const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
        
        let html = '';
        calculatedMaterials.forEach(item => {
            const matchesQuery = item.name.toLowerCase().includes(query);
            const matchesFilter = activeFilter === 'all' || item.category === activeFilter;

            if (matchesQuery && matchesFilter) {
                html += `
                    <tr>
                        <td>
                            <div style="font-weight: 600; color: var(--slate-900);">${item.name}</div>
                            <div style="font-size: 0.7rem; color: var(--slate-500);">${item.id.toUpperCase()}-ESTM</div>
                        </td>
                        <td>
                            <span class="table-category-badge ${item.category}">${item.category}</span>
                        </td>
                        <td>
                            <div class="dim-counter-wrap" style="vertical-align: middle; gap: 0.3rem;">
                                <button type="button" class="dim-btn minus-qty-btn" data-id="${item.id}"><i class="fa-solid fa-minus"></i></button>
                                <input type="number" class="qty-input" data-id="${item.id}" value="${item.qty}" min="0" style="width: 75px; border: 2px solid var(--sky-200); border-radius: 4px; padding: 0.25rem; text-align: center; font-family: monospace; font-weight: 700; color: var(--slate-800); outline: none; background: white;">
                                <button type="button" class="dim-btn plus-qty-btn" data-id="${item.id}"><i class="fa-solid fa-plus"></i></button>
                            </div> <span style="font-size: 0.75rem; color: var(--slate-500); font-weight: 600;">${item.unit}</span>
                        </td>
                        <td style="color: var(--slate-500); font-weight: 500;">
                            ₱${item.rate.toFixed(2)}
                        </td>
                        <td class="text-right table-subtotal">
                            ₱${item.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td class="text-right">
                            <button type="button" class="delete-mat-btn" data-id="${item.id}" style="background: rgba(239, 68, 68, 0.08); color: #dc2626; border: 1px solid rgba(239, 68, 68, 0.15); padding: 0.25rem 0.5rem; border-radius: 4px; cursor: pointer; font-size: 0.75rem; font-weight: 700; transition: var(--transition-quick);" title="Remove this material"><i class="fa-solid fa-trash-can"></i> Remove</button>
                        </td>
                    </tr>
                `;
            }
        });

        if (html === '') {
            html = `<tr><td colspan="6" style="text-align: center; color: var(--slate-500); padding: 2rem;">No materials matching search parameters.</td></tr>`;
        }

        materialTableBody.innerHTML = html;

        // Bind delete listeners
        materialTableBody.querySelectorAll('.delete-mat-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const button = e.target.closest('.delete-mat-btn');
                const id = button.dataset.id;
                if (!state.deletedMaterials.includes(id)) {
                    state.deletedMaterials.push(id);
                }
                calculateEverything();
            });
        });

        // Bind manual input quantity changes
        materialTableBody.querySelectorAll('.qty-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const id = e.target.dataset.id;
                const val = Math.max(0, parseInt(e.target.value) || 0);
                state.customQuantities[id] = val;
                calculateEverything();
            });
        });

        // Bind plus and minus quantity listeners
        materialTableBody.querySelectorAll('.plus-qty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const button = e.target.closest('.plus-qty-btn');
                const id = button.dataset.id;
                
                // Get current calculated quantity for this item
                const item = calculatedMaterials.find(m => m.id === id);
                if (!item) return;
                
                // Set custom override in state (increment by a reasonable step based on item type)
                let step = 1;
                if (item.unit === 'kg') step = 50;
                else if (item.unit === 'pcs') step = 100;
                else if (item.unit === 'bd ft') step = 50;
                
                const currentQty = state.customQuantities[id] !== undefined ? state.customQuantities[id] : item.qty;
                state.customQuantities[id] = currentQty + step;
                
                calculateEverything();
            });
        });
        
        materialTableBody.querySelectorAll('.minus-qty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const button = e.target.closest('.minus-qty-btn');
                const id = button.dataset.id;
                
                // Get current calculated quantity for this item
                const item = calculatedMaterials.find(m => m.id === id);
                if (!item) return;
                
                let step = 1;
                if (item.unit === 'kg') step = 50;
                else if (item.unit === 'pcs') step = 100;
                else if (item.unit === 'bd ft') step = 50;
                
                const currentQty = state.customQuantities[id] !== undefined ? state.customQuantities[id] : item.qty;
                state.customQuantities[id] = Math.max(0, currentQty - step);
                
                calculateEverything();
            });
        });

        // Update restore button visibility
        if (btnRestoreMaterials) {
            if (state.deletedMaterials.length > 0) {
                btnRestoreMaterials.style.display = 'inline-flex';
                btnRestoreMaterials.style.alignItems = 'center';
                btnRestoreMaterials.style.gap = '0.3rem';
            } else {
                btnRestoreMaterials.style.display = 'none';
            }
        }
    }

    // -------------------------------------------------------------
    // AUTOMATED SUGGESTIONS TAILOR
    // -------------------------------------------------------------
    function generateBuildingSuggestions(areaInSqm) {
        suggestionsGrid.innerHTML = '';
        
        const suggestionCatalog = [
            {
                name: 'Cozy Smart Studio',
                minArea: 20, maxArea: 75,
                beds: 1, baths: 1, floors: 1, quality: 'standard',
                desc: 'Compact single-story studio optimized for space efficiency and low utility costs.',
                accent: 'Standard Spec'
            },
            {
                name: 'Eco-Cabin Retreat',
                minArea: 30, maxArea: 90,
                beds: 2, baths: 1, floors: 1, quality: 'premium',
                desc: 'Premium sustainable cabin layout featuring tall vaulted roofing structures.',
                accent: 'Premium Spec'
            },
            {
                name: 'Modern Family Haven',
                minArea: 75, maxArea: 180,
                beds: 3, baths: 2, floors: 1, quality: 'premium',
                desc: 'Elegantly proportioned multi-bedroom cottage layout ideal for mid-sized plots.',
                accent: 'Premium Spec'
            },
            {
                name: 'Urban Duplex Starter',
                minArea: 90, maxArea: 220,
                beds: 3, baths: 2, floors: 2, quality: 'standard',
                desc: 'Durable double-story townhome concept emphasizing robust structural materials.',
                accent: 'Standard Spec'
            },
            {
                name: 'Imperial Glass Manor',
                minArea: 180, maxArea: 500,
                beds: 4, baths: 3, floors: 2, quality: 'luxury',
                desc: 'Luxurious designer estate offering high high-stud framing walls and concrete flat roofs.',
                accent: 'Luxury Spec'
            },
            {
                name: 'Elite Smart Villa',
                minArea: 220, maxArea: 500,
                beds: 5, baths: 4, floors: 3, quality: 'luxury',
                desc: 'Architectural masterpiece spanning 3 stories with smart tech integration.',
                accent: 'Luxury Spec'
            }
        ];

        const activeSuggestions = suggestionCatalog.filter(item => {
            return areaInSqm >= item.minArea && areaInSqm <= item.maxArea;
        });

        if (activeSuggestions.length === 0) {
            activeSuggestions.push(suggestionCatalog[0]);
            activeSuggestions.push(suggestionCatalog[2]);
        }

        activeSuggestions.forEach((s, idx) => {
            const isSelected = (state.bedrooms === s.beds && state.bathrooms === s.baths && state.floors === s.floors && state.quality === s.quality);
            
            const card = document.createElement('div');
            card.className = `suggestion-card ${isSelected ? 'selected' : ''}`;
            card.innerHTML = `
                <div class="s-header">
                    <h4>${s.name}</h4>
                    <span class="s-badge">${s.accent}</span>
                </div>
                <p class="s-desc">${s.desc}</p>
                <div class="s-meta">
                    <span><i class="fa-solid fa-bed"></i> ${s.beds} Bed</span>
                    <span><i class="fa-solid fa-bath"></i> ${s.baths} Bath</span>
                    <span><i class="fa-solid fa-layer-group"></i> ${s.floors} Flr</span>
                </div>
            `;

            card.addEventListener('click', () => {
                applySuggestionPreset(s);
            });

            suggestionsGrid.appendChild(card);
        });
    }

    function applySuggestionPreset(preset) {
        state.bedrooms = preset.beds;
        state.bathrooms = preset.baths;
        state.floors = preset.floors;
        state.quality = preset.quality;
        state.rooms = null; // Clear custom room positioning to regenerate suggestion layout
        state.userManagedRooms = false; // Reset user management flag so layout regenerates
        state.customQuantities = {};

        // Update form elements
        bedroomInput.value = preset.beds;
        bathroomInput.value = preset.baths;
        
        floorBtns.forEach(btn => {
            btn.classList.remove('active');
            if (parseInt(btn.dataset.floors) === preset.floors) {
                btn.classList.add('active');
            }
        });

        qualityOptions.forEach(opt => {
            opt.classList.remove('active');
            const radio = opt.querySelector('input[type="radio"]');
            if (radio.value === preset.quality) {
                opt.classList.add('active');
                radio.checked = true;
            }
        });

        calculateEverything();
    }

    // -------------------------------------------------------------
    // DYNAMIC SVG BLUEPRINT FLOOR PLAN DRAWINGS & DRAGGING
    // -------------------------------------------------------------
    function drawDynamicBlueprint(areaInSqm) {
        blueprintSvg.innerHTML = '';

        // Blueprint canvas viewport size
        const padX = 40;
        const padY = 40;
        const canvasW = 600 - (padX * 2);
        const canvasH = 400 - (padY * 2);

        // Compute foundation boundary dimensions
        const scalingFactor = Math.min(1.2, Math.max(0.7, areaInSqm / 120));
        const sqWidth = canvasW * scalingFactor;
        const sqHeight = canvasH * scalingFactor;

        const startX = padX + (canvasW - sqWidth) / 2;
        const startY = padY + (canvasH - sqHeight) / 2;

        // Draw main foundation boundary
        const foundation = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        foundation.setAttribute('x', startX);
        foundation.setAttribute('y', startY);
        foundation.setAttribute('width', sqWidth);
        foundation.setAttribute('height', sqHeight);
        foundation.setAttribute('fill', 'rgba(14, 165, 233, 0.03)');
        foundation.setAttribute('stroke', 'var(--sky-500)');
        foundation.setAttribute('stroke-width', '2.5');
        foundation.setAttribute('stroke-dasharray', '6,6');
        blueprintSvg.appendChild(foundation);

        // Labeled text inside the target house boundary
        const foundationLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        foundationLabel.setAttribute('x', startX + 15);
        foundationLabel.setAttribute('y', startY + 25);
        foundationLabel.setAttribute('fill', 'var(--sky-500)');
        foundationLabel.setAttribute('font-family', 'var(--font-heading)');
        foundationLabel.setAttribute('font-size', '11px');
        foundationLabel.setAttribute('font-weight', '700');
        foundationLabel.setAttribute('style', 'pointer-events: none; opacity: 0.8;');
        foundationLabel.textContent = `Target House Area: ${state.area} ${state.unit === 'sqm' ? 'm²' : 'sq ft'}`;
        blueprintSvg.appendChild(foundationLabel);

        // Compute pxPerMeter scale
        const targetAreaM2 = state.unit === 'sqm' ? state.area : (state.area / 10.764);
        const foundationAreaPixels = sqWidth * sqHeight;
        const pixelsPerSqm = foundationAreaPixels / targetAreaM2;
        const pxPerMeter = Math.sqrt(pixelsPerSqm);

        // Generate rooms arrangement dynamically if layout changed
        const currentLayoutKey = `${state.bedrooms}-${state.bathrooms}-${state.area}-${state.floors}`;
        // Only auto-generate if rooms is null (first load or after suggestion preset applied)
        // Once user manually manages rooms (userManagedRooms=true), never auto-regenerate
        if (!state.userManagedRooms && (!state.rooms || state.lastLayoutKey !== currentLayoutKey)) {
            state.rooms = [];
            
            if (state.bedrooms === 1 && state.bathrooms === 1) {
                // Cozy flat layout
                state.rooms.push({ id: 'r1', name: 'Living / Kitchen', type: 'living', wMeters: 5.0, hMeters: 4.5, x: startX, y: startY });
                state.rooms.push({ id: 'r2', name: 'Master Bed', type: 'bed', wMeters: 3.5, hMeters: 3.0, x: startX + 5.0 * pxPerMeter, y: startY });
                state.rooms.push({ id: 'r3', name: 'Bathroom', type: 'bath', wMeters: 3.5, hMeters: 1.5, x: startX + 5.0 * pxPerMeter, y: startY + 3.0 * pxPerMeter });
            } else if (state.bedrooms === 2) {
                // Standard layout
                state.rooms.push({ id: 'r1', name: 'Living / Dining Room', type: 'living', wMeters: 5.5, hMeters: 5.0, x: startX, y: startY });
                state.rooms.push({ id: 'r2', name: 'Master Bedroom', type: 'bed', wMeters: 4.0, hMeters: 3.0, x: startX + 5.5 * pxPerMeter, y: startY });
                state.rooms.push({ id: 'r3', name: 'Bedroom 2', type: 'bed', wMeters: 3.0, hMeters: 2.0, x: startX + 5.5 * pxPerMeter, y: startY + 3.0 * pxPerMeter });
                state.rooms.push({ id: 'r4', name: 'Bath', type: 'bath', wMeters: 1.0, hMeters: 2.0, x: startX + 8.5 * pxPerMeter, y: startY + 3.0 * pxPerMeter });
            } else {
                // Large/Custom multi-room layouts
                const bedCount = state.bedrooms;
                const bathCount = state.bathrooms;
                
                state.rooms.push({ id: 'r1', name: 'Grand Living & Lounge', type: 'living', wMeters: 5.5, hMeters: 3.5, x: startX, y: startY });
                state.rooms.push({ id: 'r2', name: 'Kitchen / Diner', type: 'living', wMeters: 5.5, hMeters: 2.0, x: startX, y: startY + 3.5 * pxPerMeter });
                
                const stackedHMeters = (sqHeight / pxPerMeter) / bedCount;
                for (let i = 0; i < bedCount; i++) {
                    state.rooms.push({ 
                        id: `r_b_${i}`,
                        name: i === 0 ? 'Master Suite' : `Bedroom ${i+1}`, 
                        type: 'bed', 
                        wMeters: 3.5, 
                        hMeters: stackedHMeters,
                        x: startX + 5.5 * pxPerMeter, 
                        y: startY + (stackedHMeters * i) * pxPerMeter
                    });
                }
                const bathStackedHMeters = (sqHeight / pxPerMeter) / bathCount;
                for (let j = 0; j < bathCount; j++) {
                    state.rooms.push({
                        id: `r_ba_${j}`,
                        name: `Bath ${j+1}`,
                        type: 'bath',
                        wMeters: 1.5,
                        hMeters: bathStackedHMeters,
                        x: startX + 9.0 * pxPerMeter,
                        y: startY + (bathStackedHMeters * j) * pxPerMeter
                    });
                }
            }
            state.lastLayoutKey = currentLayoutKey;
        } else if (state.userManagedRooms) {
            // Still update the layout key to prevent stale comparisons
            state.lastLayoutKey = currentLayoutKey;
        }

        // Always sync pixel w and h of the rooms from their meters using the current scale factor!
        state.rooms.forEach(r => {
            r.w = r.wMeters * pxPerMeter;
            r.h = r.hMeters * pxPerMeter;
        });

        // Render rooms inside dragging groups
        state.rooms.forEach((r, idx) => {
            const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            group.setAttribute('class', 'draggable-room-group');
            group.setAttribute('style', 'cursor: grab;');
            group.setAttribute('data-idx', idx);

            // Bind drag start listeners
            group.addEventListener('mousedown', startDrag);
            group.addEventListener('touchstart', startDrag, { passive: true });

            // Room background rectangle
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', r.x);
            rect.setAttribute('y', r.y);
            rect.setAttribute('width', r.w);
            rect.setAttribute('height', r.h);
            rect.setAttribute('class', `room ${r.type}`);
            group.appendChild(rect);

            // Room Walls (inner border)
            const outline = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            outline.setAttribute('x', r.x);
            outline.setAttribute('y', r.y);
            outline.setAttribute('width', r.w);
            outline.setAttribute('height', r.h);
            outline.setAttribute('fill', 'none');
            outline.setAttribute('stroke', '#ffffff');
            outline.setAttribute('stroke-width', '2.5');
            group.appendChild(outline);

            // Room textual info
            const roomAreaM2 = r.wMeters * r.hMeters;
            const displayArea = state.unit === 'sqm' ? `${roomAreaM2.toFixed(1)} m²` : `${(roomAreaM2 * 10.764).toFixed(0)} sq ft`;

            const textGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            textGroup.setAttribute('class', 'room-text-group');
            textGroup.setAttribute('transform', `translate(${r.x + r.w/2}, ${r.y + r.h/2})`);
            textGroup.setAttribute('pointer-events', 'none');

            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('class', 'room-lbl');
            label.setAttribute('text-anchor', 'middle');
            label.setAttribute('y', '-4');
            label.textContent = r.w < 60 ? r.name.substring(0, 4) + '..' : r.name;
            textGroup.appendChild(label);

            const sizeText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            sizeText.setAttribute('class', 'room-size');
            sizeText.setAttribute('text-anchor', 'middle');
            sizeText.setAttribute('y', '10');
            sizeText.textContent = displayArea;
            textGroup.appendChild(sizeText);

            // Double click to rotate
            group.addEventListener('dblclick', (evt) => {
                evt.stopPropagation();
                const temp = r.wMeters;
                r.wMeters = r.hMeters;
                r.hMeters = temp;
                calculateEverything();
            });

            // Add a rotate icon in the top right corner of the room SVG
            if (r.w >= 28 && r.h >= 28) {
                const rotBtn = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                rotBtn.setAttribute('class', 'room-rotate-icon');
                rotBtn.setAttribute('transform', `translate(${r.x + r.w - 20}, ${r.y + 4})`);
                rotBtn.setAttribute('style', 'cursor: pointer;');
                
                const rotCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                rotCircle.setAttribute('cx', '8');
                rotCircle.setAttribute('cy', '8');
                rotCircle.setAttribute('r', '7');
                rotCircle.setAttribute('fill', 'rgba(15, 23, 42, 0.6)');
                rotCircle.setAttribute('stroke', '#ffffff');
                rotCircle.setAttribute('stroke-width', '1');
                rotBtn.appendChild(rotCircle);
                
                const rotArrow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                rotArrow.setAttribute('d', 'M 8,4 A 4,4 0 1,1 4,8');
                rotArrow.setAttribute('fill', 'none');
                rotArrow.setAttribute('stroke', '#ffffff');
                rotArrow.setAttribute('stroke-width', '1.2');
                rotArrow.setAttribute('stroke-linecap', 'round');
                rotBtn.appendChild(rotArrow);

                const rotArrowHead = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                rotArrowHead.setAttribute('d', 'M 4,6.5 L 4,9 L 6.5,9');
                rotArrowHead.setAttribute('fill', 'none');
                rotArrowHead.setAttribute('stroke', '#ffffff');
                rotArrowHead.setAttribute('stroke-width', '1.2');
                rotArrowHead.setAttribute('stroke-linecap', 'round');
                rotBtn.appendChild(rotArrowHead);
                
                // Mousedown/Touchstart to stop event propagation so dragging isn't triggered
                rotBtn.addEventListener('mousedown', (evt) => {
                    evt.stopPropagation();
                });
                rotBtn.addEventListener('touchstart', (evt) => {
                    evt.stopPropagation();
                }, { passive: true });
                
                // Click to rotate
                rotBtn.addEventListener('click', (evt) => {
                    evt.stopPropagation();
                    const temp = r.wMeters;
                    r.wMeters = r.hMeters;
                    r.hMeters = temp;
                    calculateEverything();
                });
                
                group.appendChild(rotBtn);
            }

            group.appendChild(textGroup);
            blueprintSvg.appendChild(group);
        });

        // Add a scale label in the corner of SVG
        const scaleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        scaleText.setAttribute('x', '20');
        scaleText.setAttribute('y', '380');
        scaleText.setAttribute('fill', 'var(--sky-400)');
        scaleText.setAttribute('font-family', 'var(--font-heading)');
        scaleText.setAttribute('font-size', '10px');
        scaleText.setAttribute('font-weight', '700');
        scaleText.textContent = `SCALE 1 : 100 | ${state.floors} STORY BLUEPRINT PREVIEW`;
        blueprintSvg.appendChild(scaleText);

        // Populate the interactive room list table
        renderBuilderRoomList();
    }

    // -------------------------------------------------------------
    // PROGRESS & TIMELINE RENDERER (GANTT SCHEDULER WITH AUTO-DATES)
    // -------------------------------------------------------------
    const phasesData = [
        {
            id: 'site',
            name: 'Foundation & Grading',
            pctStart: 0,
            pctDuration: 20,
            tasks: ['Clearing plot area', 'Excavation & soil packing', 'Steel rebar grids laydown', 'Concrete pouring & curing'],
            icon: 'fa-solid fa-trowel-bricks'
        },
        {
            id: 'frame',
            name: 'Structural Shell & Framing',
            pctStart: 20,
            pctDuration: 30,
            tasks: ['Erecting structural columns', 'CHB wall laying & lintels', 'Floor joists installation', 'Concrete staircases & framing'],
            icon: 'fa-solid fa-hotel'
        },
        {
            id: 'roof',
            name: 'Roofing Shell Installation',
            pctStart: 50,
            pctDuration: 15,
            tasks: ['Steel roof trusses assembly', 'Pre-painted G.I. sheets fitting', 'Fascia board & gutters lining'],
            icon: 'fa-solid fa-house-chimney'
        },
        {
            id: 'utility',
            name: 'Utilities rough-ins',
            pctStart: 65,
            pctDuration: 15,
            tasks: ['Plumbing drains and valves rough-in', 'Electrical wiring conduits layout', 'Breaker board setting'],
            icon: 'fa-solid fa-plug'
        },
        {
            id: 'finish',
            name: 'Finishes & Furnishing',
            pctStart: 80,
            pctDuration: 20,
            tasks: ['Plaster wall painting layers', 'Vitrified tile laying', 'Fixtures, faucets & switches fit-out', 'Debris cleaning'],
            icon: 'fa-solid fa-paintbrush'
        }
    ];

    function renderTimeline() {
        ganttContainer.innerHTML = '';
        phaseTimelineList.innerHTML = '';

        const totalWeeks = calculations.durationWeeks;
        
        // Calculate estimated completion date automatically
        const completionDate = new Date();
        completionDate.setDate(completionDate.getDate() + calculations.durationDays);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const finishDateString = completionDate.toLocaleDateString('en-US', options);

        // Dynamically update completion time in tab header
        const scheduleHeader = document.querySelector('#tabTimeline .pane-header p');
        if (scheduleHeader) {
            scheduleHeader.innerHTML = `Track the chronological order of activities. Estimated completion: <strong>${finishDateString}</strong> (${totalWeeks} Weeks total).`;
        }

        phasesData.forEach((phase, idx) => {
            const startWeek = ((phase.pctStart / 100) * totalWeeks).toFixed(1);
            const durationWeeks = ((phase.pctDuration / 100) * totalWeeks).toFixed(1);

            // Check if phase has a manual override
            // true = user set it as complete (100%), false = user set it as incomplete (0%)
            let phaseProgress = 0;
            const phaseStartVal = phase.pctStart;
            const phaseEndVal = phase.pctStart + phase.pctDuration;

            if (state.progress >= phaseEndVal) {
                phaseProgress = 100;
            } else if (state.progress <= phaseStartVal) {
                phaseProgress = 0;
            } else {
                phaseProgress = Math.round(((state.progress - phaseStartVal) / phase.pctDuration) * 100);
            }

            // Apply manual override if set
            if (state.phaseOverrides.hasOwnProperty(phase.id)) {
                phaseProgress = state.phaseOverrides[phase.id] ? 100 : 0;
            }

            const isCompleted = phaseProgress === 100;
            const isActive = phaseProgress > 0 && phaseProgress < 100;

            // GANTT RENDERING
            const ganttRow = document.createElement('div');
            ganttRow.className = 'gantt-row';
            ganttRow.innerHTML = `
                <div class="gantt-label">${phase.name}</div>
                <div class="gantt-track">
                    <div class="gantt-bar ${isCompleted ? 'completed' : ''} ${isActive ? 'active-bar' : ''}" 
                         style="left: ${phase.pctStart}%; width: ${phase.pctDuration}%;">
                         <span class="gantt-text">${phaseProgress}%</span>
                    </div>
                </div>
            `;
            ganttContainer.appendChild(ganttRow);

            // DETAILED CARD RENDERING
            let statusBadge = `<span class="phase-status-badge pending">Pending</span>`;
            if (isActive) {
                statusBadge = `<span class="phase-status-badge current">Active - ${phaseProgress}%</span>`;
            } else if (isCompleted) {
                statusBadge = `<span class="phase-status-badge complete"><i class="fa-solid fa-circle-check"></i> Complete</span>`;
            }

            // Toggle icon: green check = complete, red x = incomplete
            const toggleIcon = isCompleted
                ? `<button class="phase-toggle-btn complete-state" data-phase-id="${phase.id}" title="Click to mark as incomplete">
                       <i class="fa-solid fa-circle-check"></i>
                   </button>`
                : `<button class="phase-toggle-btn incomplete-state" data-phase-id="${phase.id}" title="Click to mark as complete">
                       <i class="fa-solid fa-circle-xmark"></i>
                   </button>`;

            const pCard = document.createElement('div');
            pCard.className = `phase-card ${isActive ? 'active-phase' : ''} ${isCompleted ? 'completed-phase' : ''}`;
            
            let tasksListHtml = '';
            phase.tasks.forEach(t => {
                tasksListHtml += `
                    <li style="font-size: 0.75rem; margin-top: 0.2rem; color: var(--slate-600); display: flex; align-items: center; gap: 0.4rem;">
                        <i class="fa-solid ${isCompleted ? 'fa-check text-green' : 'fa-circle text-primary'}" style="font-size: 0.6rem;"></i>
                        <span>${t}</span>
                    </li>
                `;
            });

            pCard.innerHTML = `
                <div class="phase-left">
                    <div class="phase-icon">
                        <i class="${phase.icon}"></i>
                    </div>
                    <div class="phase-details">
                        <h5>${phase.name}</h5>
                        <p>Timeline: Weeks ${startWeek} - ${Math.min(totalWeeks, parseFloat(startWeek) + parseFloat(durationWeeks))} (Duration: ${durationWeeks} Weeks)</p>
                        <ul style="list-style: none; margin-top: 0.5rem; padding-left: 0;">
                            ${tasksListHtml}
                        </ul>
                    </div>
                </div>
                <div class="phase-right-controls">
                    ${toggleIcon}
                    ${statusBadge}
                </div>
            `;
            phaseTimelineList.appendChild(pCard);
        });

        // Bind toggle button events
        phaseTimelineList.querySelectorAll('.phase-toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const button = e.target.closest('.phase-toggle-btn');
                const phaseId = button.dataset.phaseId;
                // Toggle: if currently complete (green), set to incomplete (red); if incomplete, set to complete
                if (button.classList.contains('complete-state')) {
                    state.phaseOverrides[phaseId] = false; // Set to incomplete
                } else {
                    state.phaseOverrides[phaseId] = true; // Set to complete
                }
                renderTimeline();
            });
        });
    }

    // -------------------------------------------------------------
    // PRINT & EXPORT PORTAL
    // -------------------------------------------------------------
    function openExportModal() {
        // Calculate estimated completion date automatically
        const completionDate = new Date();
        completionDate.setDate(completionDate.getDate() + calculations.durationDays);
        const finishDateString = completionDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        // Hydrate data into print containers
        pArea.innerText = `${state.area} ${state.unit === 'sqm' ? 'm²' : 'sq ft'}`;
        pFloors.innerText = `${state.floors} Floor${state.floors > 1 ? 's' : ''}`;
        pBedrooms.innerText = `${state.bedrooms} Bedrooms`;
        pBathrooms.innerText = `${state.bathrooms} Bathrooms`;
        pQuality.innerText = state.quality.toUpperCase();
        
        let roofString = 'Gable Structure';
        if (state.roofType === 'flat') roofString = 'Concrete Flat Roof';
        if (state.roofType === 'hip') roofString = 'Hip Structure';
        pRoof.innerText = roofString;

        pMatCost.innerText = `₱${calculations.materialCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
        pLaborCost.innerText = `₱${calculations.laborCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
        pDuration.innerText = `${calculations.durationWeeks} Weeks (${calculations.durationDays} Working Days) - Est. Completion: ${finishDateString}`;
        pTotalCost.innerText = `₱${calculations.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

        // Set generated date
        const dateObj = new Date();
        printDateString.innerText = `Generated Prospectus Date: ${dateObj.toLocaleDateString()} @ ${dateObj.toLocaleTimeString()}`;

        // Populate print table body
        pMaterialGrid.innerHTML = '';
        calculatedMaterials.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${item.name}</strong></td>
                <td>${item.category.toUpperCase()}</td>
                <td>${item.qty.toLocaleString()} ${item.unit}</td>
                <td>₱${item.rate.toFixed(2)}</td>
                <td><strong>₱${item.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></td>
            `;
            pMaterialGrid.appendChild(tr);
        });

        // Populate print timeline grid - skip phases with 0% progress
        pTimelineGrid.innerHTML = '';
        phasesData.forEach(p => {
            const phaseStartVal = p.pctStart;
            const phaseEndVal = p.pctStart + p.pctDuration;

            let phaseProgress = 0;
            if (state.progress >= phaseEndVal) {
                phaseProgress = 100;
            } else if (state.progress > phaseStartVal) {
                phaseProgress = Math.round(((state.progress - phaseStartVal) / p.pctDuration) * 100);
            }
            // Apply manual overrides
            if (state.phaseOverrides.hasOwnProperty(p.id)) {
                phaseProgress = state.phaseOverrides[p.id] ? 100 : 0;
            }

            // Skip 0% phases
            if (phaseProgress === 0) return;

            const startW = ((p.pctStart / 100) * calculations.durationWeeks).toFixed(1);
            const durW = ((p.pctDuration / 100) * calculations.durationWeeks).toFixed(1);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${p.name}</strong></td>
                <td>Week ${startW} (Duration: ${durW} Wks) — ${phaseProgress}%</td>
                <td>${p.tasks.join(', ')}</td>
            `;
            pTimelineGrid.appendChild(tr);
        });

        // If no phases have progress, show a note
        if (pTimelineGrid.innerHTML === '') {
            pTimelineGrid.innerHTML = '<tr><td colspan="3" style="text-align:center; color: #888; padding: 1rem;">No completed phases yet.</td></tr>';
        }

        // Copy live SVG content to the printed blueprint SVG
        const printBlueprintSvg = document.getElementById('printBlueprintSvg');
        if (printBlueprintSvg) {
            printBlueprintSvg.innerHTML = blueprintSvg.innerHTML;
            // Clean up interactive edit buttons inside the exported layout
            printBlueprintSvg.querySelectorAll('.room-rotate-icon').forEach(icon => icon.remove());
        }

        // Display Modal
        exportModal.classList.add('active');
    }

    // -------------------------------------------------------------
    // ROOF DESCRIPTION UPDATER
    // -------------------------------------------------------------
    function updateRoofDescription(roofType) {
        const descBox = document.getElementById('roofDescriptionBox');
        const descText = document.getElementById('roofDescriptionText');
        if (!descBox || !descText) return;

        const descriptions = {
            gable: 'A classic triangular-shaped roof with two sloping sides that meet at a ridge. Cost-effective, excellent water drainage, and easy to build. Ideal for areas with high rainfall. Uses steel trusses and pre-painted G.I. ribbed sheets.',
            flat: 'A reinforced concrete flat roof deck (Reinforced Concrete Deck / RCD). Extremely durable and fire-resistant. Allows rooftop use as a terrace. Higher initial cost but very low maintenance. Requires proper waterproofing to prevent leaks.',
            hip: 'A multi-sloped architectural roof with slopes on all four sides meeting at a ridge. More stable and wind-resistant — ideal in typhoon-prone areas. More complex to construct than gable, but provides superior weather resistance and a modern aesthetic.'
        };

        descText.textContent = descriptions[roofType] || descriptions['gable'];

        // Update box color based on type
        descBox.className = 'roof-description-box roof-desc-' + roofType;
    }

    // -------------------------------------------------------------
    // DISCLAIMER MODAL LOGIC
    // -------------------------------------------------------------
    function initDisclaimerModal() {
        const modal = document.getElementById('customBuildDisclaimerModal');
        const proceedBtn = document.getElementById('disclaimerProceedBtn');
        if (!modal || !proceedBtn) return;

        // Check sessionStorage — only show once per session
        const hasSeenDisclaimer = sessionStorage.getItem('customBuildDisclaimerSeen');
        
        if (!hasSeenDisclaimer) {
            // Show the modal with animation
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        proceedBtn.addEventListener('click', () => {
            sessionStorage.setItem('customBuildDisclaimerSeen', '1');
            modal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    // Initialize application logic
    init();
    initDisclaimerModal();
});
