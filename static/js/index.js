const addElement = document.querySelector('.add');
const playListElement = document.querySelector('.play-list');
const menuElement = document.querySelector('.menu');
const maskElement = document.querySelector('.mask');
const inputElement = document.querySelector('#floatInput');
const textareaElement = document.querySelector('#floatTextarea');
const deleteElement = document.querySelector('.rounded-delete-btn');
const saveElement = document.querySelector('.rounded-save-btn')

let modifyItem = '';


class VideoItem {
    constructor(title, url, playTimes, order) {
        this.title = title;
        this.url = url;
        this.playTimes = playTimes;
    }

}

// 从 localStorage 获取视频列表
getItem();

addElement.addEventListener('click', () => {
    showMenu();
})


playListElement.addEventListener('click', (event) => {
    let playItem = event.target.closest('.play-item');
    if (playItem) {
        if (event.target === playItem.querySelector('.edit')) {
            //编辑点击事件
            event.stopPropagation()
            showMenu();
            inputElement.value = playItem.querySelector('.video-title').innerText;
            textareaElement.value = playItem.querySelector('.video-url').innerText;
            modifyItem = playItem;
        } else {
            // 播放列表点击事件
            changePlayStatus(playItem);
            // 增加播放次数
            playItem.querySelector('.play-times').innerText = parseInt(playItem.querySelector('.play-times').innerText) + 1;
            // 保存 localStorage
            saveItem();
        }
    }
})


maskElement.addEventListener('click', () => {
    hideMenu();
})

deleteElement.addEventListener('click', () => {
    if (modifyItem !== '') {
        modifyItem.remove();
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
function createItem(videoTitle, videoUrl, playTimes='0') {
    let fillItem = document.createElement('div')
    fillItem.setAttribute("class", "play-item");
    // 添加播放列表项
    fillItem.innerHTML = `<div class="preview-jgp"></div>
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

function changePlayStatus(element) {
    let editElement = document.querySelectorAll('.edit');
    let playingElement = document.querySelectorAll('.playing');

    // 重置编辑按钮
    editElement.forEach(edit => {
        edit.style.display = '';
    })
    // 重置播放中提示
    playingElement.forEach(playing => {
        playing.style.display = 'none';
    })

    // 隐藏编辑按钮
    element.querySelector('.edit').style.display = 'none';
    // 添加播放中提示
    element.querySelector('.playing').style.display = 'block';
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
    scrollSensitivity:60, // px, how near the mouse must be to an edge to start scrolling.
    scrollSpeed: 10, // px
    onEnd: function (/**Event*/evt) {
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
    videoItems.forEach(item => {
        createItem(item.title, item.url, item.playTimes);
    });
}