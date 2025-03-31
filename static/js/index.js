
const addElement = document.querySelector('.add');
const playListElement = document.querySelector('.play-list');
const menuElement = document.querySelector('.menu');
const maskElement = document.querySelector('.mask');
const inputElement = document.querySelector('#floatInput');
const textareaElement = document.querySelector('#floatTextarea');
const deleteElement = document.querySelector('.rounded-delete-btn');
const saveElement = document.querySelector('.rounded-save-btn');

let modifyItem = '';
let hls = null;
let player = null;

// 从 localStorage 获取视频列表
getItem();


function initHls(playUrl, playItem) {
    if (hls) {
        hls.destroy();
    }

    if (player) {
        player.destroy();
    }
    // 必须在此初始化播放器，否则清晰度或者字幕不会更新
    const video = document.querySelector('video');

    if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(playUrl);


        hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
            let availableQualities = hls.levels.map((l) => l.height);
            // 初始化Plyr
            player = initPlyr(availableQualities, video);
            setMenuStyle()
            // 增加播放次数
            changePlayStatus(playItem, true);
            // 保存 localStorage
            saveItem();

        });

        hls.on(Hls.Events.ERROR, function (event, data) {
            if (data.fatal) {
                alert("无法播放视频，请检查网络连接或视频地址。")
                changePlayStatus(playItem, false);
                hls.destroy();
            }
        });

        hls.attachMedia(video);

    }else{alert("苹果执行")}

    // waitAndPlay().then(r => console.log("开始播放"));
}

function initPlyr(qualities, video) {
    return new Plyr(video, {
        title: 'Example Title',
        controls: [
            'play-large',
            'play',
            'progress',
            'current-time',
            'settings',
            'airplay',
            'download',
            'fullscreen',
        ],
        clickToPlay: true,
        ratio: '16:9',
        speed: {
            selected: 1,
            options: [0.5, 1, 1.5, 2, 4, 8, 16]
        },
        quality: {
            default: qualities[qualities.length - 1], // 默认最高画质
            options: qualities, // 初始占位选项
            forced: true, // 强制显示质量选项
            onChange: (quality) => handleQualityChange(quality)
        },

    });
}

// 质量切换处理
function handleQualityChange(selectedQuality) {
    hls.levels.forEach((level, levelIndex) => {
        if (level.height === selectedQuality) {
            console.log("Found quality match with " + selectedQuality);
            hls.currentLevel = levelIndex;
        }
    });
}


async function waitAndPlay() {
    // 等待 player 不为 null
    while (player === null) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    // 执行播放
    player.play();
}


class VideoItem {
    constructor(title, url, playTimes) {
        this.title = title;
        this.url = url;
        this.playTimes = playTimes;
    }

}

function playVideo(playUrl, playItem) {
    // 先初始化 hls
    initHls(playUrl, playItem);
}


addElement.addEventListener('click', () => {
    showMenu();
})


playListElement.addEventListener('click', (event) => {
    let playItem = event.target.closest('.play-item');
    let playTitle = playItem.querySelector('.video-title').innerText;
    let playUrl = playItem.querySelector('.video-url').innerText;

    if (playItem) {
        if (event.target === playItem.querySelector('.edit')) {
            //编辑点击事件
            event.stopPropagation()
            showMenu();
            inputElement.value = playTitle;
            textareaElement.value = playUrl;
            modifyItem = playItem;
        } else {
            // 播放视频
            playVideo(playUrl, playItem)
        }
    }
})


maskElement.addEventListener('click', () => {
    hideMenu();
})

deleteElement.addEventListener('click', () => {
    if (modifyItem !== '') {
        modifyItem.remove();
        saveItem();
    } else {
        alert("请选择要删除的视频!")
    }
    hideMenu();
})

saveElement.addEventListener('click', () => {
    let videoTitle = inputElement.value === '' ? '默认视频标题' : inputElement.value;
    let videoUrl = textareaElement.value;

    if (videoUrl !== '') {
        // 处理添加逻辑
        if (modifyItem === '') {
            createItem(videoTitle, videoUrl);
        } else {
            // 处理修改逻辑
            modifyItem.querySelector('.video-title').innerText = videoTitle;
            modifyItem.querySelector('.video-url').innerText = videoUrl;
        }
        // 保存 localStorage
        saveItem()
    } else {
        alert("请输入m3u8视频地址!")
    }
    hideMenu();
})

/**
 * 创建播放列表项
 * @param videoTitle 视频标题
 * @param videoUrl 视频地址
 * @param playTimes 播放次数 默认为0
 */
function createItem(videoTitle, videoUrl, playTimes = '0') {
    let fillItem = document.createElement('div')
    fillItem.setAttribute("class", "play-item");
    // 添加播放列表项
    fillItem.innerHTML = `<div class="selected"></div>
                            <div class="preview-jgp"></div>
                            <div class="video-info">
                                <div class="video-title">${videoTitle}</div>
                                <div class="video-url">${videoUrl}</div>
                                <div class="video-edit">
                                    <div class="play-times-title">播放量:&nbsp;&nbsp;</div>
                                    <div class="play-times">${playTimes}</div>
                                    <div class="edit">编辑</div>
                                    <div class="playing">播放中...</div>
                                </div>
                            </div>`;
    playListElement.appendChild(fillItem);
}


function showMenu() {
    menuElement.classList.add('slide-up');
    menuElement.classList.remove('slide-down');
    maskElement.classList.add("show")
}

function hideMenu() {
    menuElement.classList.add('slide-down');
    menuElement.classList.remove('slide-up');
    maskElement.classList.remove("show")
    // 清理输入框
    inputElement.value = '';
    textareaElement.value = '';
    modifyItem = '';
}

function changePlayStatus(element, flag) {
    let editElement = document.querySelectorAll('.edit');
    let playingElement = document.querySelectorAll('.playing');
    let selectItem = document.querySelectorAll('.selected');

    if (flag) {
        // 增加播放次数
        element.querySelector('.play-times').innerText = parseInt(element.querySelector('.play-times').innerText) + 1;
    }

    // 重置编辑按钮
    editElement.forEach(edit => {
        edit.style.display = '';
    })
    // 重置播放中提示
    playingElement.forEach(playing => {
        playing.style.display = 'none';
    })
    // 重置选中的item
    selectItem.forEach(select => {
        select.style.display = 'none';
    })

    element.querySelector('.selected').style.display = 'block';

    if (flag) {
        // 隐藏编辑按钮
        element.querySelector('.edit').style.display = 'none';
        // 添加播放中提示
        element.querySelector('.playing').style.display = 'block';
    }
}

function setMenuStyle() {
    let allSetting = document.querySelector(".plyr__menu__container").querySelectorAll(".plyr__control--back");
    let videoHeight = document.querySelector(".video-pre").offsetHeight - 90;
    allSetting.forEach(setting => {
        let settingMenu = setting.nextElementSibling;
        if (settingMenu) {
            settingMenu.style.maxHeight = videoHeight.toString() + 'px';
            settingMenu.style.overflowY = 'auto';
        }
    })
}

// https://sortablejs.com/options
new Sortable(playList, {
    animation: 300,
    // 移动之后原位置元素的样式
    ghostClass: 'sortable-ghost',
    // 触发拖动但没移动的样式
    chosenClass: "sortable-choose",
    // 正在拖动的样式
    dragClass: "sortable-drag",
    direction: 'vertical',
    delay: 500,
    easing: "cubic-bezier(0.33, 1, 0.68, 1)",
    scrollSensitivity: 60, // px, how near the mouse must be to an edge to start scrolling.
    scrollSpeed: 10, // px
    onEnd: function () {
        saveItem();
    },
});


/**
 * 保存视频列表到 localStorage
 */
function saveItem() {
    let allItems = document.querySelectorAll('.play-item');
    let videoItems = [];
    allItems.forEach(item => {
        let videoItem = new VideoItem(
            item.querySelector('.video-title').innerText,
            item.querySelector('.video-url').innerText,
            item.querySelector('.play-times').innerText,
        );
        videoItems.push(videoItem);
    });
    localStorage.setItem("playList", JSON.stringify(videoItems));
}


/**
 * 从 localStorage 获取视频列表
 */
function getItem() {
    let videoItems = JSON.parse(localStorage.getItem("playList"));
    if (videoItems) {
        videoItems.forEach(item => {
            createItem(item.title, item.url, item.playTimes);
        });
    }
}
