const addElement = document.querySelector('.add');
const playListElement = document.querySelector('.play-list');
const containerHeight = playListElement.getBoundingClientRect().height;
const menuElement = document.querySelector('.menu');
const maskElement = document.querySelector('.mask');
const inputElement = document.querySelector('#floatInput');
const textareaElement = document.querySelector('#floatTextarea');
const deleteElement = document.querySelector('.rounded-delete-btn');
const saveElement = document.querySelector('.rounded-save-btn')

let modifyItem = '';
let items = [];
let activeItem = null;
let startY = 0;
let startTop = 0;
let startBottom = 0
let currentIndex = 0;
let dragTimeout = null;
let isDragging = false;


class VideoItem {
    constructor(title, url, playTimes, order) {
        this.title = title;
        this.url = url;
        this.playTimes = playTimes;
        this.order = order;
    }

    get toString() {
        return `${this.title}\n${this.url}\n${this.playTimes}\n${this.order}`;
    }

}

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
            let fillItem = document.createElement('div')
            fillItem.setAttribute("class", "play-item");
            // 添加触摸事件
            fillItem.addEventListener('touchstart', handleTouchStart);
            fillItem.addEventListener('touchmove', handleTouchMove);
            fillItem.addEventListener('touchend', handleTouchEnd);
            // 添加播放列表项
            fillItem.innerHTML = `<div class="preview-jgp"></div>
                                    <div class="video-info">
                                        <div class="video-title">${videoTitle}</div>
                                        <div class="video-url">${videoUrl}</div>
                                        <div class="video-edit">
                                            <div class="play-times-title">播放量:&nbsp;&nbsp;</div>
                                            <div class="play-times">0</div>
                                            <div class="edit">编辑</div>
                                            <div class="playing">播放中...</div>
                                        </div>
                                    </div>`;
            playListElement.appendChild(fillItem);

        } else {
            // 处理修改逻辑
            modifyItem.querySelector('.video-title').innerText = videoTitle;
            modifyItem.querySelector('.video-url').innerText = videoUrl;

        }

    } else {
        alert("请输入m3u8视频地址!")
    }

    hideMenu();
})


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


// 触摸开始
function handleTouchStart(e) {
    dragTimeout = setTimeout(() => {
        activeItem = e.target.closest(".play-item");
        items = Array.from(document.querySelectorAll('.play-item'));
        isDragging = true;
        // 记录触摸位置距离顶部的距离
        startY = e.touches[0].clientY;
        startTop = activeItem.getBoundingClientRect().top;
        startBottom = activeItem.getBoundingClientRect().bottom;
        currentIndex = items.indexOf(activeItem);
        activeItem.classList.add('active');
    }, 500);

}

// 触摸移动
function handleTouchMove(e) {
    const y = e.touches[0].clientY - startY;
    if (!isDragging) {
        if (Math.abs(y) > 1) {
            clearTimeout(dragTimeout);
        }
    } else {
        if (!activeItem) return;
        activeItem.style.transform = `translateY(${y}px)`;
        items.forEach((item, index) => {
            if (item === activeItem) return;

            let itemTop = item.getBoundingClientRect().top;
            let itemBottom = item.getBoundingClientRect().bottom;
            let activeTop = activeItem.getBoundingClientRect().top;
            let activeBottom = activeItem.getBoundingClientRect().bottom;
            console.log(activeTop + " " + activeBottom + " " );
            let modifiedY = (itemTop + itemBottom) / 2 - (startTop + startBottom) / 2;

            // 碰撞检测：中心点在目标元素范围内
            if ((activeTop + activeBottom) / 2 > itemTop && (activeTop + activeBottom) / 2 < itemBottom
            ) {
                if (y > 0) {
                    // 往下移动
                    playListElement.insertBefore(activeItem, item.nextElementSibling);
                } else {
                    // 往上移动
                    playListElement.insertBefore(activeItem, item);
                }
                activeItem.style.transform = `translateY(${y - modifiedY}px)`;


                startY += modifiedY;
                startTop = itemTop;
                startBottom = itemBottom;
            }
        });
    }

}

// 触摸结束
function handleTouchEnd() {
    clearTimeout(dragTimeout);
    if (isDragging) {
        if (!activeItem) return;
        activeItem.classList.remove('active');
        activeItem = null;
        isDragging = false;
        // 重置位置并应用过渡
        setTimeout(() => {
            items.forEach(item => {
                item.style.transform = 'translateY(0)';
            });
        }, 10);
    } else {
        // 处理短按事件
    }

}

