const mainContent = document.getElementById("main-content");
const contentsCont = document.getElementById("current-video-cont");
const currentVideoFigure = document.getElementById("current-video-fig");
const currentVideo = document.getElementById("current-video");
const progressCont = document.getElementById("current-video-progress-cont");
const progressBar = document.getElementById("current-video-progress-bar");
const seekProgress = document.getElementById("current-video-seek-bar");
const playProgress = document.getElementById("current-video-play-progress");
const playProgressThumb = document.getElementById("current-video-play-progress-thumb");
const bufferProgress = document.getElementById("current-video-buffer-progress");
const controlsCont = document.getElementById("current-video-controls-cont");
const controlBtns = [ ...document.querySelectorAll(".current-video-control-btn") ];
const playpauseBtn = document.getElementById("current-video-play-btn");
const nextBtn = document.getElementById("current-video-next-btn");
const muteBtn = document.getElementById("current-video-volume-mute-btn");
const volumeCont = document.getElementById("current-video-volume-cont");
const volumeRangeCont = document.getElementById("current-video-volume-range-cont");
const volumeRangeBar = document.getElementById("current-video-volume-range-bar");
const volumeRangeProgress = document.getElementById("current-video-volume-range");
const volumeRangeProgressThumb = document.getElementById("current-video-volume-range-thumb");
const currentTimeText = document.getElementById("current-video-current-time");
const durationTimeText = document.getElementById("current-video-duration-time");
const subtitlesBtn = document.getElementById("current-video-subtitles-btn");
const settingsBtn = document.getElementById("current-video-settings-btn");
const picinpicBtn = document.getElementById("current-video-picinpic-btn");
const theatermodeBtn = document.getElementById("current-video-theater-btn");
const fullscreenBtn = document.getElementById("current-video-fs-btn");
const volumePopup = document.getElementById("current-video-volume-popup-cont");
const storedIconsTemplate = document.getElementById("stored-icons");
const loadingCont = document.getElementById('video-loading-cont');

let DURATION; // duratuion of current playing video

let isCurrentVideoPlayProgressThumbFocus = false;
let isMouseInProgressArea = false;

let hideFsControlsTimeout = null;

if (!!currentVideo) {
    currentVideo.controls = false;
    currentVideo.removeAttribute("disablepictureinpicture");
    currentVideo.setAttribute("data-picinpic", false);
    currentVideo.setAttribute("data-theater", false);
    currentVideo.setAttribute("data-fs", false);
    controlsCont.style.display = "block";

    let lastPlayState = "paused";
    let lastCurrentTime = 0;

    /* Settings Menu */
    let MENU_STOPPED = true;   // Ensures that, only when the menu is settled in its place (after animation, transform,...), user can navifate to other menus (parent-menu, child-menu,...)
    
    // options to create video-player settings-menu -> when user clicks on each option, new settings will be set on video(quality, speed, subtitles, ...)
    const settingsMenuOptions = [
        {id: "subtitles", label: "Subtitles/CC", value: "Off", type: "navigate", submenuId: "current-video-settings-subtitles-menu", icon: storedIconsTemplate.content.getElementById("current-video-control-subtitles-icon").cloneNode(true)},
        {id: "playbackRate", label: "Playback Speed", value: "Normal", type: "navigate", submenuId: "current-video-settings-pbspeed-menu", icon: storedIconsTemplate.content.getElementById("current-video-control-playbackSpeed-icon").cloneNode(true)},
        {id: "quality", label: "Quality", value: "Auto(720p)", type: "navigate", submenuId: "current-video-settings-quality-menu", icon: storedIconsTemplate.content.getElementById("current-video-control-quality-icon").cloneNode(true)},
    ]

    const subtitlesMenuOptions = [
        {id: "current-video-settings-subtitles-menu-off", label: "Off", value: null, type: "select", data: "off", checked: true},
    ]
    for (track of [...currentVideo.textTracks]) {
        subtitlesMenuOptions.push (
            {id: `current-video-settings-subtitles-menu-${track.language}`, label: track.label, value: null, type: "select", data: track.language, checked: false, lang: track.language},
        )
    }

    const optionColors = [
        {id: "current-video-settings-subtitles-option-color-white", label: "White", value: null, type: "select", data: "white", checked: false},
        {id: "current-video-settings-subtitles-option-color-yellow", label: "Yellow", value: null, type: "select", data: "yellow", checked: false},
        {id: "current-video-settings-subtitles-option-color-green", label: "Green", value: null, type: "select", data: "green", checked: false},
        {id: "current-video-settings-subtitles-option-color-cyan", label: "Cyan", value: null, type: "select", data: "cyan", checked: false},
        {id: "current-video-settings-subtitles-option-color-red", label: "Red", value: null, type: "select", data: "red", checked: false},
        {id: "current-video-settings-subtitles-option-color-magenta", label: "Magenta", value: null, type: "select", data: "magenta", checked: false},
        {id: "current-video-settings-subtitles-option-color-blue", label: "Blue", value: null, type: "select", data: "blue", checked: false},
        {id: "current-video-settings-subtitles-option-color-black", label: "Black", value: null, type: "select", data: "black", checked: false},
    ]

    const optionFontFamilies = [
        {id: "current-video-settings-subtitles-options-fontfamily-inter", label: "Inter", value: null, type: "select", data: "inter", checked: true},
        {id: "current-video-settings-subtitles-options-fontfamily-arial", label: "Arial", value: null, type: "select", data: "arial", checked: false},
        {id: "current-video-settings-subtitles-options-fontfamily-timesnewroman", label: "Times New Roman", value: null, type: "select", data: "times-new-roman", checked: false},
    ]

    const optionFontSizes = [
        {id: "current-video-settings-subtitles-options-fontsize-50", label: "50%", value:null, type: "select", data: "50", checked: false},
        {id: "current-video-settings-subtitles-options-fontsize-75", label: "75%", value:null, type: "select", data: "75", checked: false},
        {id: "current-video-settings-subtitles-options-fontsize-100", label: "100%", value:null, type: "select", data: "100", checked: true},
        {id: "current-video-settings-subtitles-options-fontsize-150", label: "150%", value:null, type: "select", data: "150", checked: false},
        {id: "current-video-settings-subtitles-options-fontsize-200", label: "200%", value:null, type: "select", data: "200", checked: false},
        {id: "current-video-settings-subtitles-options-fontsize-300", label: "300%", value:null, type: "select", data: "300", checked: false},
        {id: "current-video-settings-subtitles-options-fontsize-400", label: "400%", value:null, type: "select", data: "400", checked: false},
    ]

    const optionOpacities = [
        {id: "current-video-settings-subtitles-options-opacity-0", label: "0%", value:null, type: "select", data: "0", checked: false},
        {id: "current-video-settings-subtitles-options-opacity-25", label: "25%", value:null, type: "select", data: "25", checked: false},
        {id: "current-video-settings-subtitles-options-opacity-50", label: "50%", value:null, type: "select", data: "50", checked: false},
        {id: "current-video-settings-subtitles-options-opacity-75", label: "75%", value:null, type: "select", data: "75", checked: false},
        {id: "current-video-settings-subtitles-options-opacity-100", label: "100%", value:null, type: "select", data: "100", checked: false},
    ]


    const optionCharacterEdgeStyles = [
        {id: "current-video-settings-subtitles-options-characteredgestyle-none", label: "None", value: null, type: "select", data: "none", checked: true},
        {id: "current-video-settings-subtitles-options-characteredgestyle-dropshadow", label: "Drop Shadow", value: null, type: "select", data: "dropshadow", checked: false},
        {id: "current-video-settings-subtitles-options-characteredgestyle-raised", label: "Raised", value: null, type: "select", data: "raised", checked: false},
        {id: "current-video-settings-subtitles-options-characteredgestyle-depressed", label: "Depressed", value: null, type: "select", data: "depressed", checked: false},
        {id: "current-video-settings-subtitles-options-characteredgestyle-outline", label: "Outline", value: null, type: "select", data: "outline", checked: false},
    ]

    const optionFontOpacities = [
        {id: "current-video-settings-subtitles-options-fontopacity-25", label: "25%", value: null, type: "select", data: "25", checked: false},
        {id: "current-video-settings-subtitles-options-fontopacity-50", label: "50%", value: null, type: "select", data: "50", checked: false},
        {id: "current-video-settings-subtitles-options-fontopacity-75", label: "75%", value: null, type: "select", data: "75", checked: false},
        {id: "current-video-settings-subtitles-options-fontopacity-100", label: "100%", value: null, type: "select", data: "100", checked: true},
    ]

    const subtitlesCustomizeOptions = [
        {id: "current-video-settings-subtitles-options-fontfamily", label: "Font Family", value: optionFontFamilies[0].label, hasSubMenu: true, type: "navigate", submenuId: "current-video-settings-subtitles-options-fontfamily-menu"}, // <li></li>
        {id: "current-video-settings-subtitles-options-fontcolor", label: "Font Color", value: optionColors[0].label, hasSubMenu: true, type: "navigate", submenuId: "current-video-settings-subtitles-options-fontcolor-menu"},
        {id: "current-video-settings-subtitles-options-fontsize", label: "Font Size", value: optionFontSizes[2].label, hasSubMenu: true, type: "navigate", submenuId: "current-video-settings-subtitles-options-fontsize-menu"},
        {id: "current-video-settings-subtitles-options-bgcolor", label: "Background Color", value: optionColors[7].label, hasSubMenu: true, type: "navigate", submenuId: "current-video-settings-subtitles-options-bgcolor-menu"},
        {id: "current-video-settings-subtitles-options-bgopacity", label: "Background Opacity", value: optionOpacities[2].label, hasSubMenu: true, type: "navigate", submenuId: "current-video-settings-subtitles-options-bgopacity-menu"},
        {id: "current-video-settings-subtitles-options-wincolor", label: "Window Color", value: optionColors[0].label, hasSubMenu: true, type: "navigate", submenuId: "current-video-settings-subtitles-options-wincolor-menu"},
        {id: "current-video-settings-subtitles-options-winopacity", label: "Window Opacities", value: optionOpacities[0].label, hasSubMenu: true, type: "navigate", submenuId: "current-video-settings-subtitles-options-winopacity-menu"},
        {id: "current-video-settings-subtitles-options-charedgestyle", label: "Character Edge Style", value: optionCharacterEdgeStyles[0].label, hasSubMenu: true, type: "navigate", submenuId: "current-video-settings-subtitles-options-charedgestyle-menu"},
        {id: "current-video-settings-subtitles-options-fontopacity", label: "Font Opacity", value: optionFontOpacities[3].label, hasSubMenu: true, type: "navigate", submenuId: "current-video-settings-subtitles-options-fontopacity-menu"},
        {id: "current-video-settings-subtitles-options-reset", label: "Reset", value: null},
    ]

    const playbackSpeedOptions = [
        {id: "current-video-settings-pbspeed-options-custom", label: "", value: "", type: "select", data: "", checked: false},
        {id: "current-video-settings-pbspeed-options-25", label: "0.25", value: null, type: "select", data: "25", checked: false},
        {id: "current-video-settings-pbspeed-options-50", label: "0.5", value: null, type: "select", data: "50", checked: false},
        {id: "current-video-settings-pbspeed-options-75", label: "0.75", value: null, type: "select", data: "75", checked: false},
        {id: "current-video-settings-pbspeed-options-100", label: "Normal", value: null, type: "select", data: "100", checked: true},
        {id: "current-video-settings-pbspeed-options-125", label: "1.25", value: null, type: "select", data: "125", checked: false},
        {id: "current-video-settings-pbspeed-options-150", label: "1.5", value: null, type: "select", data: "150", checked: false},
        {id: "current-video-settings-pbspeed-options-175", label: "1.75", value: null, type: "select", data: "175", checked: false},
        {id: "current-video-settings-pbspeed-options-200", label: "2", value: null, type: "select", data: "200", checked: false},
    ]

    const playbackSpeedCustomOptions = [
        {id: "current-video-settings-pbspeed-custom-range", range: {min: .25, max: 2, value: 2, step: .25}, centered: true, type: "range"},
        {id: "current-video-settings-pbspeed-custom-range-value", label: "1X", centeredLabel: true, centered: true, rangeId: "current-video-settings-pbspeed-custom-range", type: "show-speed"},
    ]

    const qualityOptions = [
        {id: "current-video-settings-quality-options-1080", label: "2048p", value: null, type: "select", data: "2048", checked: false},
        {id: "current-video-settings-quality-options-720", label: "1280p", value: null, type: "select", data: "1280", checked: false},
        {id: "current-video-settings-quality-options-480", label: "1024p", value: null, type: "select", data: "1024", checked: false},
        {id: "current-video-settings-quality-options-auto()", label: "auto(1024)", value: null, type: "select", data: "auto", checked: true},
    ]

    /* Created Settings Menus */
    const settingsMenus = [];

    const settingsMenu = createSettingsMenu(
        "current-video-settings-menu-list", 
        null, 
        "navigate-menu", 
        null, 
        null,
        null, 
        settingsMenuOptions
    );

    const subtitlesMenu = createSettingsMenu(
        "current-video-settings-subtitles-menu", 
        "Subtitles/CC", 
        "select-menu", 
        "Options", 
        "current-video-settings-menu-list",
        "current-video-settings-subtitles-options-menu",
        subtitlesMenuOptions, 
        `This settings only applies to the current video. Adjust captions visibilit in <a href="#" >Settings</a> for all videos.`
    );

    const subtitlesOptionsMenu = createSettingsMenu(
        "current-video-settings-subtitles-options-menu", 
        "Options", 
        "navigate-menu", 
        null, 
        "current-video-settings-subtitles-menu", 
        null,
        subtitlesCustomizeOptions
    );
    const subtitlesFontFamilyMenu = createSettingsMenu(
        "current-video-settings-subtitles-options-fontfamily-menu", 
        "Font Family", 
        "select-menu", 
        null, 
        "current-video-settings-subtitles-options-menu", 
        null,
        optionFontFamilies,
    );
    const subtitlesFontColorMenu = createSettingsMenu(
        "current-video-settings-subtitles-options-fontcolor-menu", 
        "Font Color",
        "select-menu", 
        null, 
        "current-video-settings-subtitles-options-menu", 
        null,
        optionColors,
    );
    const subtitlesFontSizeMenu = createSettingsMenu(
        "current-video-settings-subtitles-options-fontsize-menu", 
        "Font Size", 
        "select-menu", 
        null, 
        "current-video-settings-subtitles-options-menu", 
        null,
        optionFontSizes,
    );
    const subtitlesBgColorMenu = createSettingsMenu(
        "current-video-settings-subtitles-options-bgcolor-menu", 
        "Background Color", 
        "select-menu", 
        null, 
        "current-video-settings-subtitles-options-menu", 
        null,
        optionColors,
    );
    const subtitlesBgOpacityMenu = createSettingsMenu(
        "current-video-settings-subtitles-options-bgopacity-menu", 
        "Background Opacity", 
        "select-menu", 
        null, 
        "current-video-settings-subtitles-options-menu", 
        null,
        optionOpacities,
    );
    const subtitlesWindowColorMenu = createSettingsMenu(
        "current-video-settings-subtitles-options-wincolor-menu", 
        "Window Color", 
        "select-menu", 
        null, 
        "current-video-settings-subtitles-options-menu", 
        null,
        optionColors,
    );
    const subtitlesWindowOpacityMenu = createSettingsMenu(
        "current-video-settings-subtitles-options-winopacity-menu", 
        "Window Opacity", 
        "select-menu", 
        null, 
        "current-video-settings-subtitles-options-menu", 
        null,
        optionOpacities,
    );
    const subtitlesCharEdgeStyleMenu = createSettingsMenu(
        "current-video-settings-subtitles-options-charedgestyle-menu", 
        "Character Edge Style", 
        "select-menu", 
        null, 
        "current-video-settings-subtitles-options-menu", 
        null,
        optionCharacterEdgeStyles,
    );
    const subtitlesFontOpacityMenu = createSettingsMenu(
        "current-video-settings-subtitles-options-fontopacity-menu", 
        "Font Opacity", 
        "select-menu", 
        null, 
        "current-video-settings-subtitles-options-menu", 
        null,
        optionFontOpacities,
    );

    const pbSpeedMenu = createSettingsMenu(
        "current-video-settings-pbspeed-menu", 
        "Playback Speed", 
        "select-menu", 
        "Custom", 
        "current-video-settings-menu-list",
        "current-video-settings-pbspeed-custom-menu",
        playbackSpeedOptions,
    );

    const pbSpeedCustomMenu = createSettingsMenu(
        "current-video-settings-pbspeed-custom-menu", 
        "Custom", 
        "show-menu", 
        null,
        "current-video-settings-pbspeed-menu", 
        null,
        playbackSpeedCustomOptions,
    );

    const qualityMenu = createSettingsMenu(
        "current-video-settings-quality-menu", 
        "Quality", 
        "select-menu", 
        null, 
        "current-video-settings-menu-list",
        null,
        qualityOptions,
    );
    /* ----------------------------------------------------------- */

    const settingsFragment = document.createDocumentFragment();
    const menuContainer = settingsFragment.appendChild(document.createElement("div"));
    menuContainer.id = "menu-container";
    menuContainer.setAttribute("data-display", "hidden");
    menuContainer.setAttribute("role", "menu");
    menuContainer.setAttribute("aria-label", "video settings menu");

    settingsBtn.appendChild(menuContainer);
    menuContainer.appendChild(settingsMenu);
    settingsMenu.setAttribute("data-isactive", true);


    // creates setting menu by given options
    function createSettingsMenu(id, title, type, subMenuTitle = null, parentmenuid = null, submenuId = null, children = null, description = null) {
        const fragment = document.createDocumentFragment();
        const menu = fragment.appendChild( document.createElement("ul") );
        menu.id = id;
        menu.classList.add("current-video-settings-menu");
        menu.setAttribute("data-type", type);
        menu.setAttribute("data-isactive", false);
        if (!!parentmenuid) menu.setAttribute("data-parentmenuid", parentmenuid);
        if (!!submenuId) menu.setAttribute("data-submenuid", submenuId);

        if (!!title) {
            const menuHeader = menu.appendChild( document.createElement("div") )
            menuHeader.classList.add("current-video-settings-menu-header");
            const returnBtn = menuHeader.appendChild( document.createElement("div") );
            returnBtn.classList.add("current-video-settings-menu-header-return-btn");
            returnBtn.setAttribute("tabindex", 0);
            const headerTitle = document.createElement("div");
            headerTitle.innerText = title;
            returnBtn.appendChild( storedIconsTemplate.content.getElementById("current-video-control-settings-arrow-left-icon").cloneNode(true) )
            returnBtn.appendChild( headerTitle );

            if (!!subMenuTitle) {
                const submenuBtn = document.createElement("div");
                submenuBtn.classList.add("current-video-settings-menu-header-submenu-btn");
                submenuBtn.setAttribute("tabindex", 0);
                submenuBtn.innerText = subMenuTitle;
                menuHeader.appendChild(submenuBtn);
            }

        }
        
        children.forEach(child => {
            menu.appendChild( createSettingsMenuItem(child) )
        })

        if (!!description) {
            const menuDescription = document.createElement("div");
            menuDescription.classList.add("current-video-settings-menu-description");
            menuDescription.innerHTML = description;
            menu.appendChild(menuDescription);
        }

        settingsMenus.push(menu);
        return menu;
    }

    // creates each option of settings menu
    function createSettingsMenuItem( {id, label = null, centeredLabel = null, centered = null, value = null, icon = null, type = null, data = null, submenuId = null, hasSubMenu = null, checked = null, range = null, rangeId = null} ) {
        const item = document.createElement("li");
        item.id = id;
        item.classList.add("current-video-settings-menu-item");
        item.setAttribute("tabindex", 0);
        item.setAttribute("data-video-controler", "");
        if (!!type) item.setAttribute("data-type", type);
        if (!!data) item.setAttribute("data-data", data);
        if (!!submenuId) item.setAttribute("data-submenuid", submenuId);
        if (!!centered) item.classList.add("current-video-settings-menu-centered-item");
        item.setAttribute("data-isactive", false);
        if (!!rangeId) item.setAttribute("data-rangeid", rangeId);

        if (label !== null && label !== undefined) {
            item.setAttribute("data-label", label);
            const itemTitle = document.createElement("div");
            if (!!centeredLabel) {
                itemTitle.classList.add("current-video-settings-menu-item-centered-title");
            } else {
                itemTitle.classList.add("current-video-settings-menu-item-title");
            }
            itemTitle.innerText = label;
            item.appendChild(itemTitle);
        }

        if (value !== null && value !== undefined) {
            item.setAttribute("data-value", value);
            const itemValue = document.createElement("div");
            itemValue.classList.add("current-video-settings-menu-item-value");
            itemValue.innerText = value;
            item.appendChild(itemValue);
        }

        if (!!range) {
            item.setAttribute("tabindex", -1);
            const itemRangeCont = document.createElement("div");
            itemRangeCont.classList.add("current-video-settings-menu-item-range-cont");
            const itemRangeProgress = document.createElement("div");
            itemRangeProgress.classList.add("current-video-settings-menu-item-range-progress");
            const itemRange = document.createElement("input");
            itemRange.setAttribute("type", "range");
            itemRange.setAttribute("min", range.min ?? 0);
            itemRange.setAttribute("max", range.max ?? 100);
            itemRange.setAttribute("step", range.step ?? 1);
            itemRange.value = "1";
            itemRange.classList.add("current-video-settings-menu-item-range");
            itemRangeProgress.style.width = `${100 * (itemRange.value - parseInt( itemRange.getAttribute("min") )) / ( parseInt( itemRange.getAttribute("max") ) - parseInt( itemRange.getAttribute("min") ) )}%`;
            itemRange.addEventListener("input", function(e) {
                currentVideo.playbackRate = e.currentTarget.value;
                pbSpeedMenu.querySelector("#current-video-settings-pbspeed-options-custom").querySelector(".current-video-settings-menu-item-title").innerText = "Custom";
                pbSpeedMenu.querySelector("#current-video-settings-pbspeed-options-custom").querySelector(".current-video-settings-menu-item-value").innerText = e.currentTarget.value;
                itemRangeProgress.style.width = `${100 * (e.currentTarget.value - parseInt( itemRange.getAttribute("min") )) / ( parseInt( itemRange.getAttribute("max") ) - parseInt( itemRange.getAttribute("min") ) )}%`;
                checkSelectedSettingsItem( pbSpeedMenu.querySelector("#current-video-settings-pbspeed-options-custom") );
                [...itemRange.closest("ul").children].forEach(child => {
                    if (child.getAttribute("data-rangeid") === id) {
                        const childLabel = child.querySelector("div.current-video-settings-menu-item-title") || child.querySelector("div.current-video-settings-menu-item-centered-title");
                        if (!!child.getAttribute("data-type") && child.getAttribute("data-type") === "show-speed") {
                            childLabel.innerText = itemRange.value + "X";
                        } else {
                            childLabel.innerText = itemRange.value;
                        }
                    }
                });
                [...item.parentElement.parentElement.parentElement.children].forEach(parentitem => {
                    if (parentitem.getAttribute("data-submenuid") === item.parentElement.parentElement.id) {
                        parentitem.querySelector(".current-video-settings-menu-item-value").innerText = itemRange.value;
                    }
                });
            });
            itemRangeCont.appendChild(itemRange);
            itemRangeCont.appendChild(itemRangeProgress);
            item.appendChild(itemRangeCont);
        }

        if (!!icon) {
            item.prepend(icon);
        }

        if (!!hasSubMenu) {
            item.appendChild( storedIconsTemplate.content.getElementById("current-video-control-settings-arrow-right-icon").cloneNode(true) );
        }

        if (!!type && type === "select") {
            const itemCheckCont = item.appendChild( document.createElement("div") );
            itemCheckCont.classList.add("current-video-settings-menu-item-check-cont");
            item.prepend(itemCheckCont);

            if (!!checked) {
                item.setAttribute("data-checked", true);
                const checkIcon = storedIconsTemplate.content.getElementById("current-video-control-settings-subtitles-check-icon").cloneNode(true);
                itemCheckCont.appendChild(checkIcon);
            }
        }

        return item;
    }

    // Initializing settings-menu (subtitles)
    initSubtitleOptionsCustomization();   


    // Events
    if (!!window.addEventListener) {

        currentVideo.addEventListener("contextmenu", (e) => {   // To avoid video-download by user
            e.preventDefault();
        })

        currentVideo.addEventListener('canplay', function () {
            controlBtns.forEach(btn => {
                btn.setAttribute("data-state", "active");
                btn.setAttribute("aria-disabled", false);
            })
        }, false);

        if (currentVideo.readyState >= currentVideo.HAVE_FUTURE_DATA) {
            controlBtns.forEach(btn => {
                btn.setAttribute("data-state", "active");
                btn.setAttribute("aria-disabled", false);
            })
        }

        /* Time Change */
        currentVideo.addEventListener("durationchange", function() {
            DURATION = Math.floor(currentVideo.duration);
            durationTimeText.innerText = formatVideoTime(DURATION);
            progressBar.setAttribute('aria-valuemin', '0');
            progressBar.setAttribute('aria-valuemax', DURATION);
            progressBar.setAttribute('aria-valuenow', '0');
            progressBar.setAttribute('aria-valuetext', formatVideoTime(0));
        })
        /* ------------------------------------------- */

        /* Loading Spinner */
        currentVideo.addEventListener("waiting", () => {
            if (loadingCont.classList.contains('shown')) return;
            
            loadingCont.classList.add('shown');
        })
        
        currentVideo.addEventListener("playing", () => {
            if (loadingCont.classList.contains('shown')) {
                loadingCont.classList.remove("shown");
            }
        });

        currentVideo.addEventListener("pause", () => {
            if (loadingCont.classList.contains('shown')) {
                loadingCont.classList.remove("shown");
            }
        });

        currentVideo.addEventListener("ended", () => {
            if (loadingCont.classList.contains('shown')) {
                loadingCont.classList.remove("shown");
            }
        });
        /* ------------------------------------------- */


        /* Progress Bar changes */
        progressBar.addEventListener("mousemove", function(e) {   // Show 'seek-point' by hovering on 'progress bar'
            seekProgress.style.width = `${(100 * (e.offsetX)) / progressBar.offsetWidth}%`;
        })
        progressBar.addEventListener("mouseleave", function() {
            seekProgress.style.width = "0%";
        })

        currentVideo.addEventListener("progress", function() {
            if (currentVideo.duration === 0) return;
            for (let i = 0; i < currentVideo.buffered.length; i++) {
                if (currentVideo.buffered.start(currentVideo.buffered.length - 1 - i) < currentVideo.currentTime) {
                    bufferProgress.style.width = `${100 * currentVideo.buffered.end(currentVideo.buffered.length - 1 - i) / currentVideo.duration}%`;
                    break;
                }
            }
        })


        currentVideo.addEventListener("timeupdate", function() {    // Update the 'play-progress' by updating the time of video
            const crntTime = Math.floor(currentVideo.currentTime);
            playProgress.style.width = `${(100 * crntTime) / DURATION}%`;
            currentTimeText.innerText = formatVideoTime(crntTime);
            lastCurrentTime = crntTime;
            progressBar.setAttribute('aria-valuenow', crntTime);
            progressBar.setAttribute('aria-valuetext', formatVideoTime(crntTime));
        })

        progressBar.addEventListener("click", function(e) {
            const boundingRect = e.currentTarget.getBoundingClientRect();
            const clickPos = (e.pageX - boundingRect.left) / e.currentTarget.offsetWidth;
            currentVideo.currentTime = clickPos * currentVideo.duration;
            
        })

        progressCont.addEventListener("mouseenter", function() {
            isMouseInProgressArea = true;
            growPlayProgThumb();
        })

        progressCont.addEventListener("mouseleave", function() {
            isMouseInProgressArea = false;
            if (isCurrentVideoPlayProgressThumbFocus) return;
            shrinkPlayProgThumb();
        })

        playProgressThumb.addEventListener("mousedown", function(e) {
            isCurrentVideoPlayProgressThumbFocus = true;
            growPlayProgThumb();
            document.addEventListener("mousemove", handleSeekDrag);
        })

        document.addEventListener("mouseup", function(e) {
            document.removeEventListener("mousemove", handleSeekDrag);
            isCurrentVideoPlayProgressThumbFocus = false;
            if (!isMouseInProgressArea) {
                shrinkPlayProgThumb();
            }
        })

        // keyboard seeking video
        progressBar.addEventListener('focus', function(e) {
            window.addEventListener('keydown', handleKbdSeeking);
        })
        progressBar.addEventListener('blur', function(e) {
            window.removeEventListener('keydown', handleKbdSeeking);
        })

        function handleKbdSeeking(e) {
            const code = e.keyCode || e.which || e.charCode;
            if (code !== 37 && code !== 39) return;
            switch(code) {
                case 37:
                    seekCurrentVideo5SecByKbd('-');
                    break;
                case 39:
                    seekCurrentVideo5SecByKbd('+');
                    break;
            }
        }

        // We set the last mouseX to the last offsetLeft of 'play-progress thumb' (distance between the 'thumb' and the 'start of the progressbar')
        function handleSeekDrag(e) {
            let lastMousePosX = playProgressThumb.offsetLeft + (playProgressThumb.offsetWidth / 2);
            let crntPlayProgWidthPercent = (100 * playProgress.offsetWidth) / progressBar.offsetWidth;
            let mouseX = (e.pageX - progressBar.getBoundingClientRect().left < 0 ) ? 0 : (e.pageX - progressBar.getBoundingClientRect().left > (progressBar.offsetWidth) ) ? progressBar.offsetWidth : e.pageX - progressBar.getBoundingClientRect().left;
            let mousePosXDiff = mouseX - lastMousePosX;
            playProgress.style.width = `${crntPlayProgWidthPercent + (100 * mousePosXDiff / progressBar.offsetWidth)}%`;
            lastMousePosX = mouseX;
            updateCurrentVideoCurrentTime();
        }
        // function handleSeekDrag(event) {
        //     console.log(event.target.offsetLeft);
        //     let crntPlayProgWidthPercent = (100 * playProgress.offsetWidth) / progressBar.offsetWidth;
            
        //     let crntMousePosX = event.pageX;

        //     if ( Math.ceil(crntPlayProgWidthPercent) >= 100 ) {
        //         lastMousePosX = progressBar.getBoundingClientRect().left + progressBar.offsetWidth;
        //     }
        //     else if ( Math.floor(crntPlayProgWidthPercent) <= 0 ) {
        //         lastMousePosX = progressBar.getBoundingClientRect().left;
        //     }

        //     let mousePosXDiff = crntMousePosX - lastMousePosX;

        //     if ((mousePosXDiff > 0) && (crntPlayProgWidthPercent < 100)) {
        //         playProgress.style.width = `${crntPlayProgWidthPercent + (100 * mousePosXDiff / progressBar.offsetWidth)}%`;
        //     }
        //     else if ((mousePosXDiff < 0) && (crntPlayProgWidthPercent > 0)) {
        //         playProgress.style.width = `${crntPlayProgWidthPercent + (100 * mousePosXDiff / progressBar.offsetWidth)}%`;
        //     }

        //     lastMousePosX = crntMousePosX;
        //     updateCurrentVideoCurrentTime();
        //     if ( Math.floor(crntPlayProgWidthPercent) >= 100 ) {
        //         lastMousePosX = progressBar.getBoundingClientRect().left + progressBar.offsetWidth;
        //     }
        //     else if ( Math.floor(crntPlayProgWidthPercent) <= 0 ) {
        //         lastMousePosX = progressBar.getBoundingClientRect().left;
        //     }
        // }
        /*---------------------------------------------*/

        /* Volume Range */
        muteBtn.addEventListener('focus', function(e) {
            volumeRangeCont.classList.remove("shrunk-vol-range");
            volumeRangeCont.classList.add("grown-vol-range");
            volumeRangeProgressThumb.classList.remove("shrunk-vol-range-thumb");
            volumeRangeProgressThumb.classList.add("grown-vol-range-thumb");
        });

        muteBtn.addEventListener('blur', function(e) {
            volumeRangeCont.classList.remove("grown-vol-range");
            volumeRangeCont.classList.add("shrunk-vol-range");
            volumeRangeProgressThumb.classList.remove("grown-vol-range-thumb");
            volumeRangeProgressThumb.classList.add("shrunk-vol-range-thumb");
        });

        volumeCont.addEventListener("mouseenter", function() {
            volumeRangeCont.classList.remove("shrunk-vol-range");
            volumeRangeCont.classList.add("grown-vol-range");
            volumeRangeProgressThumb.classList.remove("shrunk-vol-range-thumb");
            volumeRangeProgressThumb.classList.add("grown-vol-range-thumb");
        })

        volumeCont.addEventListener("mouseleave", function() {
            volumeRangeCont.classList.remove("grown-vol-range");
            volumeRangeCont.classList.add("shrunk-vol-range");
            volumeRangeProgressThumb.classList.remove("grown-vol-range-thumb");
            volumeRangeProgressThumb.classList.add("shrunk-vol-range-thumb");
        })

        volumeRangeBar.addEventListener("focus", function() {
            volumeRangeCont.classList.remove("shrunk-vol-range");
            volumeRangeCont.classList.add("grown-vol-range");
            volumeRangeProgressThumb.classList.remove("shrunk-vol-range-thumb");
            volumeRangeProgressThumb.classList.add("grown-vol-range-thumb");
        })

        volumeRangeBar.addEventListener("blur", function() {
            volumeRangeCont.classList.remove("grown-vol-range");
            volumeRangeCont.classList.add("shrunk-vol-range");
            volumeRangeProgressThumb.classList.remove("grown-vol-range-thumb");
            volumeRangeProgressThumb.classList.add("shrunk-vol-range-thumb");
        })

        volumeRangeBar.addEventListener("click", function(e) {
            const boundingRect = e.currentTarget.getBoundingClientRect();
            const clickPos = (e.pageX - boundingRect.left) / e.currentTarget.offsetWidth;
            console.log(clickPos)
            currentVideo.volume = clickPos;
        })

        // keyboard volume change
        volumeRangeBar.addEventListener('focus', function(e) {
            window.addEventListener('keydown', handleKbdVolChange);
        })
        volumeRangeBar.addEventListener('blur', function(e) {
            window.removeEventListener('keydown', handleKbdVolChange);
        })

        function handleKbdVolChange(e) {
            const code = e.keyCode || e.which || e.charCode;
            if (code !== 37 && code !== 39) return;
            switch(code) {
                case 37:
                    alterCurrentVideoVolumeByKbd('-');
                    break;
                case 39:
                    alterCurrentVideoVolumeByKbd('+');
                    break;
            }
            changeMuteIcon();
        }

        currentVideo.addEventListener("volumechange", function() {
            let volume = Math.floor(100 * currentVideo.volume);
            volumeRangeProgress.style.width = volume + "%";
            volumeRangeBar.setAttribute('aria-valuenow', volume);
            volumeRangeBar.setAttribute('aria-valuetext', volume);
        })

        volumeRangeProgressThumb.addEventListener("mousedown", function() {
            window.addEventListener("mousemove", handleVolumeDrag);
        })

        window.addEventListener("mouseup", function() {
            window.removeEventListener("mousemove", handleVolumeDrag);
        })

        function handleVolumeDrag(e) {
            let lastMousePosXVol = volumeRangeProgressThumb.offsetLeft + (volumeRangeProgressThumb.offsetWidth / 2);
            let crntVolProgWidthPercent = (100 * volumeRangeProgress.offsetWidth) / volumeRangeBar.offsetWidth;
            let mouseX = (e.pageX - volumeRangeBar.getBoundingClientRect().left < 0) ? 0 : (e.pageX - volumeRangeBar.getBoundingClientRect().left > volumeRangeBar.offsetWidth) ? volumeRangeBar.offsetWidth : e.pageX - volumeRangeBar.getBoundingClientRect().left ;
            let mousePosXDiff = mouseX - lastMousePosXVol;
            volumeRangeProgress.style.width = `${crntVolProgWidthPercent + (100 * mousePosXDiff / volumeRangeBar.offsetWidth)}%`;
            lastMousePosXVol = mouseX;
            updateCurrentVideoVolume();
        }
        // let lastMousePosXVol;
        // function handleVolumeDrag(e) {
        //     let crntVolProgWidthPercent = (100 * volumeRangeProgress.offsetWidth) / volumeRangeBar.offsetWidth;
        //     let mouseX = (e.pageX - volumeRangeBar.getBoundingClientRect().left < 0) ? 0 : (e.pageX - volumeRangeBar.getBoundingClientRect().left > volumeRangeBar.offsetWidth) ? volumeRangeBar.offsetWidth : e.pageX - volumeRangeBar.getBoundingClientRect().left ;
        
        //     let crntMousePosX = e.pageX;

        //     if ( Math.ceil(crntVolProgWidthPercent) >= 100 ) {
        //         lastMousePosXVol = volumeRangeBar.getBoundingClientRect().left + volumeRangeBar.offsetWidth;
        //     }
        //     else if ( Math.floor(crntVolProgWidthPercent) <= 0 ) {
        //         lastMousePosXVol = volumeRangeBar.getBoundingClientRect().left;
        //     }

        //     let mousePosXDiff = crntMousePosX - lastMousePosXVol;
        //     // volumeRangeProgress.style.width = `${crntVolProgWidthPercent + (100 * mousePosXDiff / volumeRangeBar.offsetWidth)}%`;

        //     if ((mousePosXDiff > 0) && (crntVolProgWidthPercent < 100)) {
        //         volumeRangeProgress.style.width = `${crntVolProgWidthPercent + (100 * mousePosXDiff / volumeRangeBar.offsetWidth)}%`;
        //     }
        //     else if ((mousePosXDiff < 0) && (crntVolProgWidthPercent > 0)) {
        //         volumeRangeProgress.style.width = `${crntVolProgWidthPercent + (100 * mousePosXDiff / volumeRangeBar.offsetWidth)}%`;
        //     }

        //     lastMousePosXVol = crntMousePosX;
        //     updateCurrentVideoVolume();
        //     if ( Math.floor(crntVolProgWidthPercent) >= 100 ) {
        //         lastMousePosXVol = progressBar.getBoundingClientRect().left + progressBar.offsetWidth;
        //     }
        //     else if ( Math.floor(crntVolProgWidthPercent) <= 0 ) {
        //         lastMousePosXVol = progressBar.getBoundingClientRect().left;
        //     }
        // }
        /* ------------------------------------------- */


        /*Control Buttons Click / Keyboard Press */
        document.addEventListener("click", function(e) {   // Main 'video-control-btn' s
            const controlBtnIcon = e.target.closest(".current-video-control-btn-icon");
            let controlBtn;
            if (!!controlBtnIcon) {
                if (controlBtnIcon.id === "current-video-control-subtitles-icon" || e.target.matches("#current-video-subtitle-btn-box")) {
                    controlBtn = controlBtnIcon.closest("#current-video-subtitles-btn")
                } else {
                    controlBtn = controlBtnIcon.parentElement;
                }
            } else {
                if (e.target.matches(".current-video-control-btn")) {
                    controlBtn = e.target;
                } else {
                    return;
                }
            }
            if (!controlBtn || controlBtn.getAttribute("data-state") !== "active") return;
            const btnId = controlBtn.getAttribute("id");
            switch (btnId) {
                case "current-video-play-btn":
                    handlePlaypauseCurrentVideo();
                    break;
                case "current-video-volume-mute-btn":
                    handleMuteCurrentVideo();
                    break;
                case "current-video-subtitles-btn":
                    toggleCurrentVideoDefaultSubtitle();
                    break;
                case "current-video-settings-btn":
                    showHideSettingsMenu();
                    break;
                case "current-video-picinpic-btn":
                    if ( !!document.pictureInPictureEnabled ) {
                        toggleCurrentVideoPicinpic();
                    }
                    break;
                case "current-video-theater-btn":
                    toggleCurrentVideoTheaterMode();
                    break;
                case "current-video-fs-btn":
                    if ( !!document.fullscreenEnabled ) {
                        toggleCurrentVideoFullscreen();
                    }
                    break;
            }
        })

        document.addEventListener("click", function(e) {   // Setting Menu Options
            const settingsMenu = e.target.closest(".current-video-settings-menu");
            if (!settingsMenu) return;
            
            let settingsItem;
            let settingsSubmenuBtn;
            const returnBtn = e.target.closest(".current-video-settings-menu-header-return-btn");  // so User has clicked on return button
            if (!!returnBtn) {
                returnToSettingsParentmenu(settingsMenu);
            }

            switch ( settingsMenu.getAttribute("data-type") ) {
                case "navigate-menu":
                    settingsItem = e.target.closest(".current-video-settings-menu-item");
                    settingsSubmenuBtn = e.target.closest(".current-video-settings-menu-header-submenu-btn");
                    if (!!settingsItem) {
                        goToSettingsSubmenu("from-item", settingsMenu, settingsItem);
                        if (settingsItem.id === "current-video-settings-subtitles-options-reset") {
                            initSubtitleOptionsCustomization();
                        }
                    }
                    if (!!settingsSubmenuBtn) {
                        goToSettingsSubmenu("from-menu-btn", settingsMenu, settingsItem);
                    }
                    break;
                case "select-menu":
                    settingsItem = e.target.closest(".current-video-settings-menu-item");
                    if (!!settingsItem) {
                        settingsMenus.forEach(parentmenu => {
                            [...parentmenu.querySelectorAll("li")].forEach (item => {
                                if ( item.getAttribute("data-submenuid") === settingsMenu.id ) {
                                    item.querySelector(".current-video-settings-menu-item-value").innerText = settingsItem.getAttribute("data-label");
                                }
                            })
                        })
                        checkSelectedSettingsItem(settingsItem);
                        switch (settingsMenu.id) {
                            case "current-video-settings-subtitles-menu":
                                changeCurrentVideoSubtitle( settingsItem.getAttribute("data-data") );
                                break;
                            case "current-video-settings-subtitles-options-fontfamily-menu":
                                changeCurrentVideoSubtitleFontFamily( settingsItem, settingsItem.getAttribute("data-data") );
                                break;
                            case "current-video-settings-subtitles-options-fontcolor-menu":
                                changeCurrentVideoSubtitleFontColor( settingsItem, settingsItem.getAttribute("data-data") );
                                break;
                            case "current-video-settings-subtitles-options-fontsize-menu":
                                changeCurrentVideoSubtitleFontSize( settingsItem, settingsItem.getAttribute("data-data") );
                                break;
                            case "current-video-settings-subtitles-options-bgcolor-menu":
                                changeCurrentVideoSubtitleBgColor( settingsItem, settingsItem.getAttribute("data-data") );
                                break;
                            case "current-video-settings-subtitles-options-bgopacity-menu":
                                changeCurrentVideoSubtitleBgOpacity( settingsItem, settingsItem.getAttribute("data-data") );
                                break;
                            case "current-video-settings-subtitles-options-wincolor-menu":
                                changeCurrentVideoSubtitleWinColor( settingsItem, settingsItem.getAttribute("data-data") );
                                break;
                            case "current-video-settings-subtitles-options-winopacity-menu":
                                changeCurrentVideoSubtitleWinOpacity( settingsItem, settingsItem.getAttribute("data-data") );
                                break;
                            case "current-video-settings-subtitles-options-charedgestyle-menu":
                                changeCurrentVideoSubtitleCharEdgeStyle( settingsItem, settingsItem.getAttribute("data-data") );
                                break;
                            case "current-video-settings-subtitles-options-fontopacity-menu":
                                changeCurrentVideoSubtitleFontOpacity( settingsItem, settingsItem.getAttribute("data-data") );
                                break;
                            case "current-video-settings-pbspeed-menu":
                                changeCurrentVideoPbSpeed( settingsItem, settingsItem.getAttribute("data-data") );
                                break;
                            case "current-video-settings-quality-menu":
                                changeCurrentVideoQuality( settingsItem, settingsItem.getAttribute("data-data") );
                                break;
                        }
                        initSettingsMenuPosition();
                        showHideSettingsMenu();
                    } 
                    settingsSubmenuBtn = e.target.closest(".current-video-settings-menu-header-submenu-btn");
                    if (!!settingsSubmenuBtn) {
                        goToSettingsSubmenu("from-menu-btn", settingsMenu, settingsItem);
                    }
                    break;
                case "show-menu":  // Do nothing
                    break;
            }

            e.stopPropagation();
        })

        controlBtns.forEach(btn => {
            btn.addEventListener("mouseenter", function(e) {
                btn.querySelector(".control-btn-tooltip").style.display = "block";
            })
            btn.addEventListener("mouseleave", function(e) {
                btn.querySelector(".control-btn-tooltip").style.display = "none";
            })
            btn.addEventListener("focus", function(e) {
                btn.querySelector(".control-btn-tooltip").style.display = "block";
            })
            btn.addEventListener("blur", function(e) {
                btn.querySelector(".control-btn-tooltip").style.display = "none";
            })
        })

        function showControlBtnTooltip(btn) {
            btn.querySelector(".control-btn-tooltip").style.display = "block";
        }

        function hideControlBtnTooltip(btn) {
            btn.querySelector(".control-btn-tooltip").style.display = "none";
        }

        currentVideo.addEventListener("click", function(e) {
            if (e.target !== currentVideo) return;
            handlePlaypauseCurrentVideo();
        })

        currentVideo.addEventListener("play", function(e) {
            if (e.target !== currentVideo) return;
            changePlaypauseIcon();
            if (document.querySelector('.fs-controls-cont')) {
                clearTimeout(hideFsControlsTimeout);
                hideFsControlsTimeout = setTimeout(() => {
                    controlsCont.style.opacity = "0";
                }, 3000);
            }
        })

        currentVideo.addEventListener("pause", function(e) {
            if (e.target !== currentVideo) return;
            changePlaypauseIcon();
            if (document.querySelector('.fs-controls-cont')) {
                clearTimeout(hideFsControlsTimeout);
                controlsCont.style.opacity = "1";
            }
        })

        // Mobile Size Controls //
        if (window.innerWidth <= 720) {
            menuContainer.classList.add("mobile-menu-container")
            currentVideo.addEventListener("click", function(e) {
                if (!controlsCont.classList.contains("focused-controls-cont")) {
                    controlsCont.classList.add("focused-controls-cont");
                }
                
                if (!currentVideo.paused && menuContainer.getAttribute("data-display") === 'hidden' ) {
                    setTimeout(() => {
                        controlsCont.classList.remove("focused-controls-cont");
                    }, 3000);
                }
            })
        }
        //------------------------------//

        window.addEventListener("fullscreenchange", function(e) {
            if (document.fullscreenElement === null) {
                currentVideo.setAttribute("data-fs", false);
                currentVideo.classList.remove("fs-current-video");
                controlsCont.classList.remove("fs-controls-cont");
                controlsCont.style.opacity = "1";
                menuContainer.classList.remove("fs-menu-container");
                theatermodeBtn.style.display = "flex";
                picinpicBtn.style.display = "flex";
            } else {
                currentVideo.setAttribute("data-fs", true);
                mainContent.classList.remove("theater-main-content");
                currentVideo.classList.remove("theater-current-video");
                currentVideo.classList.add("fs-current-video");
                contentsCont.classList.remove("theater-video-cont");
                controlsCont.classList.add("fs-controls-cont");
                menuContainer.classList.add("fs-menu-container");
                theatermodeBtn.style.display = "none";
                picinpicBtn.style.display = "none";
            }
            changeCurrentVideoFsIcon();
        })

        window.addEventListener("keydown", function(e) {
            if (document.activeElement !== currentVideo) return;
            const kbdCode = e.which ?? e.charCode ?? e.keyCode;
            switch (kbdCode) {
                case 32:  // space
                    handlePlaypauseCurrentVideo();
                    e.preventDefault();
                    break;
                case 37:  // Left Arrow
                    e.preventDefault();
                    seekCurrentVideo5SecByKbd('-');
                    break;
                case 39:  // Right Arrow
                    e.preventDefault();
                    seekCurrentVideo5SecByKbd('+');
                    break;
                case 38:  // Top Arrow
                    e.preventDefault();
                    alterCurrentVideoVolumeByKbd('+')
                    break;
                case 40:  // Bottom Arrow
                    e.preventDefault();
                    alterCurrentVideoVolumeByKbd('-')
                    break;
            }
        })

        window.addEventListener("keypress", (e) => {
            const code = e.keyCode || e.charCode || e.which;
            if (code === 13) {
                document.activeElement.click();
            }
        })


        controlsCont.addEventListener("mouseenter", (e) => {
            clearTimeout(hideFsControlsTimeout);
            const controlsCont = e.target.closest(".fs-controls-cont");
            if (!controlsCont) return;
            controlsCont.style.opacity = "1";
        })

        controlsCont.addEventListener("mouseleave", (e) => {
            const controlsCont = e.target.closest(".fs-controls-cont");
            if (!controlsCont) return;
            clearTimeout(hideFsControlsTimeout);
            hideFsControlsTimeout = setTimeout(() => {
                controlsCont.style.opacity = "0";
            }, 3000);
        })

        /* ----------------------End of Events----------------------------- */

    } else {  // fallback code, when there is no 'eventListener' in browser
        if (currentVideo.readyState >= currentVideo.HAVE_FUTURE_DATA) {
            controlBtns.forEach(btn => {
                btn.setAttribute("data-state", "active");
            })
        }
    }

    // handler-functions, to work on video
    function growPlayProgThumb() {
        playProgressThumb.classList.remove("shrink-thumb");
        playProgressThumb.classList.add("grown-thumb");
    }

    function shrinkPlayProgThumb() {
        playProgressThumb.classList.remove("grown-thumb");
        playProgressThumb.classList.add("shrink-thumb");
    }

    function goToSettingsSubmenu(from, menu, item) {
        if (from === "from-item") {
            const submenuId = item.getAttribute("data-submenuid");
            settingsMenus.forEach(submenu => {
                if (submenu.id === submenuId) {
                    showSettingsSubmenu(menu, submenu);
                }
            })
        }
        else if (from === "from-menu-btn") {
            const submenuId = menu.getAttribute("data-submenuid");
            settingsMenus.forEach(submenu => {
                if (submenu.id === submenuId) {
                    showSettingsSubmenu(menu, submenu);
                }
            })
        }
    }

    function returnToSettingsParentmenu(menu) {
        settingsMenus.forEach(parentmenu => {
            if ( parentmenu.id === menu.getAttribute("data-parentmenuid") ) {
                hideCurrentMenu(parentmenu, menu);
            }
        })
    }

    let menuTransitionTime = .5;
    
    function showSettingsSubmenu(menu, submenu) {
        if (!MENU_STOPPED) return;
        MENU_STOPPED = false;
        // menuContainer.appendChild(submenu);
        menu.appendChild(submenu);
        submenu.style.position = "absolute";
        submenu.style.top = "0";
        submenu.style.right = (-2 * menuContainer.offsetWidth) + "px";
        submenu.style.display = "block";
        menu.setAttribute("data-isactive", true);
        menuContainer.style.transition = `height ${menuTransitionTime}s`;
        menuContainer.style.height = submenu.offsetHeight + "px";

        settingsMenuGoLeft(menu);
        settingsMenuGoLeft(submenu);

        setTimeout(() => {
            MENU_STOPPED = true;
            if (menuContainer.offsetHeight < parseInt(getComputedStyle(menuContainer).getPropertyValue("max-height"))) {
                menuContainer.scrollTo(0, 0);
                menuContainer.style.overflowY = "hidden";
            } else {
                menuContainer.style.overflowY = "auto";
            }
            setFocusOnFirstSettingsMenuChild(submenu);
        }, menuTransitionTime * 1000)
    }

    function setFocusOnFirstSettingsMenuChild(menu) {
        menu.querySelector(".current-video-settings-menu-item").focus();
    }


    function hideCurrentMenu(menu, submenu) {
        if (!MENU_STOPPED) return;
        MENU_STOPPED = false;
        menu.style.position = "absolute";
        submenu.style.position = "absolute";
        submenu.style.right = (2 * menuContainer.offsetWidth) + "px";
        menuContainer.style.transition = `height ${menuTransitionTime}s`;
        menuContainer.style.height = menu.offsetHeight + "px";

        settingsMenuGoRight(submenu);
        settingsMenuGoRight(menu);
        
        setTimeout(() => {
            MENU_STOPPED = true;
            submenu.style.display = "none";
            menu.removeChild(submenu);
            menu.setAttribute("data-isactive", false);
            if (menuContainer.offsetHeight < parseInt(getComputedStyle(menuContainer).getPropertyValue("max-height"))) {
                menuContainer.scrollTo(0, 0);
                menuContainer.style.overflowY = "hidden";
            } else {
                menuContainer.style.overflowY = "auto";
            }
            setFocusOnFirstSettingsMenuChild(menu);
        }, menuTransitionTime * 1000)
    }

    function settingsMenuGoLeft(menu) {
        let currentTransformX = parseInt( getTransformX( getComputedStyle(menu).getPropertyValue("transform") ) );
        menu.style.transition = `transform ${menuTransitionTime}s`;
        menu.style.transform = `translateX(${ currentTransformX - menuContainer.offsetWidth }px)`;
        currentTransformX -= menuContainer.offsetWidth;
    }

    function settingsMenuGoRight(menu) {
        let currentTransformX = parseInt(getTransformX( getComputedStyle(menu).getPropertyValue("transform") ));
        menu.style.transition = `transform ${menuTransitionTime}s`;
        menu.style.transform = `translateX(${ currentTransformX + menuContainer.offsetWidth }px)`;
        currentTransformX += menuContainer.offsetWidth;
    }

    function getTransformX(transform) {
        let transformBar = transform.slice( transform.indexOf("(") + 1, transform.indexOf(")") );
        let transformArr = transformBar.split(", ");
        return transformArr[4];
    }

    function checkSelectedSettingsItem(item) {
        if (item.getAttribute("data-checked") === "true") return;
        const checkIcon = storedIconsTemplate.content.querySelector("#current-video-control-settings-subtitles-check-icon").cloneNode(true);
        [...item.parentElement.children].forEach(item => {
            if ( !!item.getAttribute("data-checked") && item.getAttribute("data-checked") === "true" ) {
                const checkIcon = item.querySelector("#current-video-control-settings-subtitles-check-icon");
                item.setAttribute("data-checked", false);
                item.querySelector(".current-video-settings-menu-item-check-cont").removeChild(checkIcon);
            }
        })
        item.querySelector(".current-video-settings-menu-item-check-cont").appendChild( checkIcon );
        item.setAttribute("data-checked", true);
    }

    function handlePlaypauseCurrentVideo() {
        if (currentVideo.paused || currentVideo.ended) {
            currentVideo.play();
            changePlaypauseIcon();
            lastPlayState = 'playing';
        } else {
            currentVideo.pause();
            changePlaypauseIcon();
            lastPlayState = 'paused';
        }
    }

    function changePlaypauseIcon() {
        if (currentVideo.paused || currentVideo.ended) {
            if (playpauseBtn.querySelector("#current-video-control-pause-icon")) {
                playpauseBtn.querySelector("#current-video-control-pause-icon").remove();
                playpauseBtn.appendChild(storedIconsTemplate.content.getElementById("current-video-control-play-icon").cloneNode(true));
            }
        } else {
            if (playpauseBtn.querySelector("#current-video-control-play-icon")) {
                playpauseBtn.querySelector("#current-video-control-play-icon").remove();
                playpauseBtn.appendChild(storedIconsTemplate.content.getElementById("current-video-control-pause-icon").cloneNode(true));
            }
        }
    }

    function handleMuteCurrentVideo() {
        currentVideo.muted = !currentVideo.muted;
        changeMuteIcon();

    }
    function changeMuteIcon() {
        if (currentVideo.muted || currentVideo.volume === 0) {
            if (muteBtn.querySelector("#current-video-control-unmuted-icon")) {
                muteBtn.querySelector("#current-video-control-unmuted-icon").remove();
                muteBtn.appendChild(storedIconsTemplate.content.getElementById("current-video-control-muted-icon").cloneNode(true));
            }
        } else {
            if (muteBtn.querySelector("#current-video-control-muted-icon")) {
                muteBtn.querySelector("#current-video-control-muted-icon").remove();
                muteBtn.appendChild(storedIconsTemplate.content.getElementById("current-video-control-unmuted-icon").cloneNode(true));
            }
        }
    }

    function updateCurrentVideoCurrentTime() {
        currentVideo.currentTime = (playProgress.offsetWidth / progressBar.offsetWidth) * currentVideo.duration;
    }

    function updateCurrentVideoVolume() {
        currentVideo.volume = volumeRangeProgress.offsetWidth / volumeRangeBar.offsetWidth;
        changeMuteIcon();
    }
    
    function formatVideoTime(time) {
        let hours = format( Math.floor(time / 3600) % 24 );
        let mins = format( Math.floor(time / 60) % 60 );
        let secs = format( Math.floor(time) % 60 );
    
        return (+hours !== 0) ? `${hours}:${mins}:${secs}` : `${mins}:${secs}`;
    
        function format(timePart) {
            return (timePart >= 10) ? String(timePart) : 0 + String(timePart);
        }
    }

    function initSettingsMenuPosition() {
        settingsMenus.forEach(menu => {
            menu.style.transform = "translateX(0)"
        })
        settingsMenu.removeChild( settingsMenu.querySelector("ul") );
        settingsMenu.style.height = "fit-content";
        menuContainer.style.transition = `height ${menuTransitionTime}s`;
        menuContainer.style.height = settingsMenu.offsetHeight + "px";
    }
    
    function showHideSettingsMenu() {
        if (menuContainer.getAttribute("data-display") === "hidden") {
            menuContainer.style.display = "flex";
            menuContainer.setAttribute("data-display", "shown");
            menuContainer.setAttribute("data-isactive", true);
            settingsBtn.setAttribute("aria-expanded", true);
            menuContainer.querySelector(".current-video-settings-menu-item").focus();
        }
        else if (menuContainer.getAttribute("data-display") === "shown") {
            menuContainer.style.display = "none";
            menuContainer.setAttribute("data-display", "hidden");
            menuContainer.setAttribute("data-isactive", false);
            settingsBtn.setAttribute("aria-expanded", false);
        }
    }

    function toggleCurrentVideoDefaultSubtitle() {
        let subtitletrack;
        let defaultTrackElement;
        currentVideo.querySelectorAll("track").forEach(track => {
            if (track.getAttribute("data-default") === "true") {
                defaultTrackElement = track;
            }
        })
        Array.from(currentVideo.textTracks).forEach(txtTrack => {
            if (txtTrack.language === defaultTrackElement.getAttribute("srclang")) {
                if (txtTrack.mode === 'hidden' || txtTrack.mode === 'disabled') {
                    txtTrack.mode = 'showing';
                    document.querySelector("#current-video-subtitles-btn-icon-box").classList.remove("inactive-subtitle-btn");
                    document.querySelector("#current-video-subtitles-btn-icon-box").classList.add("active-subtitle-btn");
                    [...subtitlesMenu.children].forEach(item => {
                        if ( item.getAttribute("data-data") === defaultTrackElement.getAttribute("srclang") ) {
                            checkSelectedSettingsItem(item);
                            settingsMenu.querySelector("#subtitles").querySelector(".current-video-settings-menu-item-value").innerText = item.getAttribute("data-label") || "On";
                        }
                    })
                } 
                else if (txtTrack.mode === 'showing') {
                    txtTrack.mode = 'hidden';
                    document.querySelector("#current-video-subtitles-btn-icon-box").classList.remove("active-subtitle-btn");
                    document.querySelector("#current-video-subtitles-btn-icon-box").classList.add("inactive-subtitle-btn");
                    checkSelectedSettingsItem( subtitlesMenu.querySelector("#current-video-settings-subtitles-menu-off") );
                    settingsMenu.querySelector("#subtitles").querySelector(".current-video-settings-menu-item-value").innerText = "Off";
                }
            } else {
                txtTrack.mode = 'hidden';
            }
        })
    }

    function changeCurrentVideoSubtitle(lang) {
        [...currentVideo.textTracks].forEach (track => {
            if (track.language === lang) {
                track.mode = 'showing';
            } else {
                track.mode = 'hidden';
            }
        })
    }

    function initSubtitleOptionsCustomization() {
        changeCurrentVideoSubtitleFontFamily(subtitlesFontFamilyMenu.querySelector("#current-video-settings-subtitles-options-fontfamily-inter"), "inter");
        changeCurrentVideoSubtitleFontColor(subtitlesFontColorMenu.querySelector("#current-video-settings-subtitles-option-color-white"), "white");
        changeCurrentVideoSubtitleFontSize(subtitlesFontSizeMenu.querySelector("#current-video-settings-subtitles-options-fontsize-100"), "100");
        changeCurrentVideoSubtitleBgColor(subtitlesBgColorMenu.querySelector("#current-video-settings-subtitles-option-color-black"), "black");
        changeCurrentVideoSubtitleBgOpacity(subtitlesBgOpacityMenu.querySelector("#current-video-settings-subtitles-options-opacity-50"), "50");
        changeCurrentVideoSubtitleWinColor(subtitlesWindowColorMenu.querySelector("#current-video-settings-subtitles-option-color-black"), "black");
        changeCurrentVideoSubtitleWinOpacity(subtitlesWindowOpacityMenu.querySelector("#current-video-settings-subtitles-options-opacity-0"), "0");
        changeCurrentVideoSubtitleCharEdgeStyle(subtitlesCharEdgeStyleMenu.querySelector("#current-video-settings-subtitles-options-characteredgestyle-none"), "none");
        changeCurrentVideoSubtitleFontOpacity(subtitlesFontOpacityMenu.querySelector("#current-video-settings-subtitles-options-fontopacity-100"), "100");
    }

    function changeCurrentVideoSubtitleFontFamily(item, fontfamily) {
        currentVideo.setAttribute("data-subfont", fontfamily);
        checkSelectedSettingsItem(item);
        settingsMenus.forEach(parentmenu => {
            if (parentmenu.id === item.parentElement.getAttribute("data-parentmenuid")) {
                [...parentmenu.children].forEach(parentitem => {
                    if (parentitem.getAttribute("data-submenuid") === item.parentElement.id) {
                        parentitem.querySelector(".current-video-settings-menu-item-value").innerText = item.getAttribute("data-label");
                    }
                })
            }
        })
    }

    function changeCurrentVideoSubtitleFontColor(item, color) {
        currentVideo.setAttribute("data-subfontcolor", color);
        checkSelectedSettingsItem(item);
        settingsMenus.forEach(parentmenu => {
            if (parentmenu.id === item.parentElement.getAttribute("data-parentmenuid")) {
                [...parentmenu.children].forEach(parentitem => {
                    if (parentitem.getAttribute("data-submenuid") === item.parentElement.id) {
                        parentitem.querySelector(".current-video-settings-menu-item-value").innerText = item.getAttribute("data-label");
                    }
                })
            }
        })
    }

    function changeCurrentVideoSubtitleFontSize(item, fontsize) {
        currentVideo.setAttribute("data-subfontsize", fontsize);
        checkSelectedSettingsItem(item);
        settingsMenus.forEach(parentmenu => {
            if (parentmenu.id === item.parentElement.getAttribute("data-parentmenuid")) {
                [...parentmenu.children].forEach(parentitem => {
                    if (parentitem.getAttribute("data-submenuid") === item.parentElement.id) {
                        parentitem.querySelector(".current-video-settings-menu-item-value").innerText = item.getAttribute("data-label");
                    }
                })
            }
        })
    }

    function changeCurrentVideoSubtitleBgColor(item, color) {
        currentVideo.setAttribute("data-subbgcolor", color);
        checkSelectedSettingsItem(item);
        settingsMenus.forEach(parentmenu => {
            if (parentmenu.id === item.parentElement.getAttribute("data-parentmenuid")) {
                [...parentmenu.children].forEach(parentitem => {
                    if (parentitem.getAttribute("data-submenuid") === item.parentElement.id) {
                        parentitem.querySelector(".current-video-settings-menu-item-value").innerText = item.getAttribute("data-label");
                    }
                })
            }
        })
    }

    function changeCurrentVideoSubtitleBgOpacity(item, opacity) {
        currentVideo.setAttribute("data-subbgopacity", opacity);
        checkSelectedSettingsItem(item);
        settingsMenus.forEach(parentmenu => {
            if (parentmenu.id === item.parentElement.getAttribute("data-parentmenuid")) {
                [...parentmenu.children].forEach(parentitem => {
                    if (parentitem.getAttribute("data-submenuid") === item.parentElement.id) {
                        parentitem.querySelector(".current-video-settings-menu-item-value").innerText = item.getAttribute("data-label");
                    }
                })
            }
        })
    }

    function changeCurrentVideoSubtitleWinColor(item, color) {
        currentVideo.setAttribute("data-subwincolor", color);
        checkSelectedSettingsItem(item);        
        settingsMenus.forEach(parentmenu => {
            if (parentmenu.id === item.parentElement.getAttribute("data-parentmenuid")) {
                [...parentmenu.children].forEach(parentitem => {
                    if (parentitem.getAttribute("data-submenuid") === item.parentElement.id) {
                        parentitem.querySelector(".current-video-settings-menu-item-value").innerText = item.getAttribute("data-label");
                    }
                })
            }
        })
    }

    function changeCurrentVideoSubtitleWinOpacity(item, opacity) {
        currentVideo.setAttribute("data-subwincolor", opacity);
        checkSelectedSettingsItem(item);        
        settingsMenus.forEach(parentmenu => {
            if (parentmenu.id === item.parentElement.getAttribute("data-parentmenuid")) {
                [...parentmenu.children].forEach(parentitem => {
                    if (parentitem.getAttribute("data-submenuid") === item.parentElement.id) {
                        parentitem.querySelector(".current-video-settings-menu-item-value").innerText = item.getAttribute("data-label");
                    }
                })
            }
        })
    }

    function changeCurrentVideoSubtitleCharEdgeStyle(item, edgeStyle) {
        currentVideo.setAttribute("data-subchedgestyle", edgeStyle);
        checkSelectedSettingsItem(item);        
        settingsMenus.forEach(parentmenu => {
            if (parentmenu.id === item.parentElement.getAttribute("data-parentmenuid")) {
                [...parentmenu.children].forEach(parentitem => {
                    if (parentitem.getAttribute("data-submenuid") === item.parentElement.id) {
                        parentitem.querySelector(".current-video-settings-menu-item-value").innerText = item.getAttribute("data-label");
                    }
                })
            }
        })
    }

    function changeCurrentVideoSubtitleFontOpacity(item, opacity) {
        currentVideo.setAttribute("data-subfontopacity", opacity);
        checkSelectedSettingsItem(item);
        settingsMenus.forEach(parentmenu => {
            if (parentmenu.id === item.parentElement.getAttribute("data-parentmenuid")) {
                [...parentmenu.children].forEach(parentitem => {
                    if (parentitem.getAttribute("data-submenuid") === item.parentElement.id) {
                        parentitem.querySelector(".current-video-settings-menu-item-value").innerText = item.getAttribute("data-label");
                    }
                })
            }
        })
    }

    function changeCurrentVideoPbSpeed(item, speed) {
        currentVideo.playbackRate = speed / 100;
    }

    function changeCurrentVideoQuality(item, quality) {
        switch (quality) {
            case "2048" :
                currentVideo.querySelector("source").src = "./assets/videos/sintel-2048-surround.mp4";
                currentVideo.load();
                currentVideo.currentTime = lastCurrentTime;
                if (lastPlayState === 'playing') {
                    handlePlaypauseCurrentVideo();
                    lastPlayState = 'playing';
                }
                break;
            case "1280" :
                currentVideo.querySelector("source").src = "./assets/videos/sintel-1280-surround.mp4";
                currentVideo.load();
                currentVideo.currentTime = lastCurrentTime;
                if (lastPlayState === 'playing') {
                    handlePlaypauseCurrentVideo();
                    lastPlayState = 'playing';
                }
                break;
            case "1024" :
                currentVideo.querySelector("source").src = "./assets/videos/sintel-1024-surround.mp4";
                currentVideo.load();
                currentVideo.currentTime = lastCurrentTime;
                if (lastPlayState === 'playing') {
                    handlePlaypauseCurrentVideo();
                    lastPlayState = 'playing';
                }
                break;
            case "auto" :
                currentVideo.querySelector("source").src = "./assets/videos/sintel-1024-surround.mp4";
                currentVideo.load();
                currentVideo.currentTime = lastCurrentTime;
                if (lastPlayState === 'playing') {
                    handlePlaypauseCurrentVideo();
                    lastPlayState = 'playing';
                }
                break;
        }
    }


    function toggleCurrentVideoPicinpic() {
        if (document.pictureInPictureElement === null) {
            currentVideo.requestPictureInPicture();
            currentVideo.setAttribute("data-picinpic", true);
        } else {
            document.exitPictureInPicture();
            currentVideo.setAttribute("data-picinpic", false);
        }
    }

    function toggleCurrentVideoTheaterMode() {
        if (currentVideo.getAttribute("data-theater") === "false") {
            mainContent.classList.add("theater-main-content");
            contentsCont.classList.add("theater-video-cont");
            currentVideo.classList.add("theater-current-video");
            currentVideo.setAttribute("data-theater", true)
        } 
        else if (currentVideo.getAttribute("data-theater") === "true") {
            mainContent.classList.remove("theater-main-content");
            contentsCont.classList.remove("theater-video-cont");
            currentVideo.classList.remove("theater-current-video");
            currentVideo.setAttribute("data-theater", false)
        }
    }

    function toggleCurrentVideoFullscreen() {
        if (document.fullscreenElement === null) {
            currentVideoFigure.requestFullscreen();
            currentVideo.setAttribute("data-fs", true);
            controlsCont.classList.add("fs-controls-cont");
            addFsControlsShowHide();
            changeCurrentVideoFsIcon();
        } else {
            document.exitFullscreen();
            currentVideo.setAttribute("data-fs", false);
            controlsCont.classList.remove("fs-controls-cont");
            changeCurrentVideoFsIcon();
        }
    }
    
    function addFsControlsShowHide() {
        document.querySelectorAll("[data-video-controler]").forEach(btn => {
            btn.addEventListener("focus", (e) => {
                const controlsCont = e.target.closest(".fs-controls-cont");
                if (!controlsCont) return;
                controlsCont.style.opacity = "1";
            })
            btn.addEventListener("blur", (e) => {
                const controlsCont = e.target.closest(".fs-controls-cont");
                if ( !controlsCont || !!( e.relatedTarget?.matches("[data-video-controler]") ) ) return;
                setTimeout(() => {
                    controlsCont.style.opacity = "0";
                }, 3000);
            })
        })
    }

    function changeCurrentVideoFsIcon() {
        if (currentVideo.getAttribute("data-fs") === "true") {
            [...fullscreenBtn.children].forEach(child => {
                if (child.matches("svg")) fullscreenBtn.removeChild(child);
            });
            fullscreenBtn.appendChild( storedIconsTemplate.content.querySelector("#current-video-control-minimise-icon") .cloneNode(true));
        } else if (currentVideo.getAttribute("data-fs") === "false") {
            [...fullscreenBtn.children].forEach(child => {
                if (child.matches("svg")) fullscreenBtn.removeChild(child);
            });
            fullscreenBtn.appendChild( storedIconsTemplate.content.querySelector("#current-video-control-fs-icon").cloneNode(true) );
        }
    }

    
    function seekCurrentVideo5SecByKbd(dir) {
        let crntTime = currentVideo.currentTime;
        let duration = currentVideo.duration;
        let popup;
        let icons;
        if (dir === '+') {
            currentVideo.currentTime += ( crntTime <= (duration - 5) ) ? 5 : 0;
            popup = document.getElementById("current-video-5secseek-cont-forward");
            popup.style.display = "flex";
            icons = document.querySelectorAll(".current-video-5secseek-icon-forward");
            icons.forEach(icon => {
                if (getComputedStyle(icon).getPropertyValue("animation-play-state") === 'paused') {
                    icon.style.animationPlayState = "running";
                }
            } )
        }
        else if (dir === '-') {
            currentVideo.currentTime -= ( crntTime >= 5 ) ? 5 : 0;
            popup = document.getElementById("current-video-5secseek-cont-back");
            popup.style.display = "flex";
            icons = document.querySelectorAll(".current-video-5secseek-icon-back");
            icons.forEach(icon => {
                if (getComputedStyle(icon).getPropertyValue("animation-play-state") === 'paused') {
                    icon.style.animationPlayState = "running";
                }
            } )
        }
        lastMousePosX = playProgressThumb.offsetLeft + (playProgressThumb.offsetWidth / 2);
        setTimeout(() => {
            popup.style.display = "none";
        }, 1250);
    }

    function alterCurrentVideoVolumeByKbd(dir) {
        let vol = currentVideo.volume * 100;
        if (dir === '+') {
            vol = Math.floor(vol - (vol % 5));
            vol += (vol < 100) ? 5 : 0;
            currentVideo.volume = vol / 100;
            volumePopup.innerText = vol + "%";
        }
        else if (dir === '-') {
            vol = Math.floor(vol - (vol % 5));
            vol -= (vol > 0) ? 5 : 0;
            currentVideo.volume = vol / 100;
            volumePopup.innerText = vol + "%";
        }
        volumePopup.style.display = "block";

        setTimeout(() => {
            volumePopup.style.display = "none";
        }, 1000);
    }

}


