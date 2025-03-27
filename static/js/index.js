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
        this.order = order;
    }

    get toString() {
        return `${this.title}\n${this.url}\n${this.playTimes}\n${this.order}`;
    }

}

addElement.addEventListener('click', () => {
    showMenu();
})


playListElement.addEventListener('click',(event)=>{
    let playItem = event.target.closest('.play-item');
    if (playItem) {
        if (event.target === playItem.querySelector('.edit')) {
            //编辑点击事件
            event.stopPropagation()
            showMenu();
            inputElement.value = playItem.querySelector('.video-title').innerText;
            textareaElement.value = playItem.querySelector('.video-url').innerText;
            modifyItem = playItem;
        }else {
            // 播放列表点击事件
            changePlayStatus(playItem);
        }
    }
})


maskElement.addEventListener('click',()=>{
    hideMenu();
})

deleteElement.addEventListener('click',()=>{
    if (modifyItem !== ''){
        modifyItem.remove();
    }else {
        alert("请选择要删除的视频!")
    }
    hideMenu();
})

saveElement.addEventListener('click',()=>{
    let videoTitle = inputElement.value === '' ? '默认视频标题' : inputElement.value;
    let videoUrl = textareaElement.value;

    if (videoUrl !== ''){
        // 处理添加逻辑
        if (modifyItem === ''){
            let fillItem = document.createElement('div')
            fillItem.setAttribute("class", "play-item");
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

        }else {
            // 处理修改逻辑
            modifyItem.querySelector('.video-title').innerText = videoTitle;
            modifyItem.querySelector('.video-url').innerText = videoUrl;

        }

    }else {
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
    editElement.forEach(edit =>{
        edit.style.display = '';
    })
    // 重置播放中提示
    playingElement.forEach(playing =>{
        playing.style.display = 'none';
    })

    // 隐藏编辑按钮
    element.querySelector('.edit').style.display = 'none';
    // 添加播放中提示
    element.querySelector('.playing').style.display = 'block';
}

// 在index.js中添加以下代码

let draggingItem = null;
let placeholder = null;
let initialTop = 0;
let isLongPress = false;
let dragTimeout;


// 添加事件监听
playListElement.addEventListener('touchstart', handleTouchStart);
playListElement.addEventListener('touchmove', handleTouchMove);
playListElement.addEventListener('touchend', handleTouchEnd);

function handleTouchStart(e) {
    const touch = e.touches[0];
    const target = e.target.closest('.play-item');

    if (!target) return;

    // 长按检测
    isLongPress = false;
    startX = touch.clientX;
    startY = touch.clientY;
    startTime = Date.now();

    dragTimeout = setTimeout(() => {
        isLongPress = true;
        startDrag(target, touch);
    }, 500);
}

function handleTouchMove(e) {
    if (!isLongPress) {
        const dx = Math.abs(e.touches[0].clientX - startX);
        const dy = Math.abs(e.touches[0].clientY - startY);

        if (dx > 10 || dy > 10) {
            clearTimeout(dragTimeout);
            isLongPress = false;
        }
    }

    if (isLongPress) {
        e.preventDefault();
        const touch = e.touches[0];
        draggingItem.style.transform = `translate(${touch.clientX - startX}px, ${touch.clientY - startY}px)`;

        const targetIndex = findDropTarget(touch.clientY);
        updatePlaceholderPosition(targetIndex);
    }
}

function handleTouchEnd() {
    clearTimeout(dragTimeout);

    if (isLongPress) {
        const targetIndex = findDropTarget(event.changedTouches[0].clientY);
        commitDrop(targetIndex);
        resetDragState();
    }

    isLongPress = false;
}


function startDrag(item, touch) {
    draggingItem = item;
    draggingItem.classList.add('dragging');

    // 创建占位符
    placeholder = document.createElement('div');
    placeholder.className = 'play-item placeholder';
    placeholder.style.height = `${item.offsetHeight}px`;

    // 记录原始位置
    const originalNextSibling = item.nextSibling;

    // 插入占位符到原始位置
    if (originalNextSibling) {
        playListElement.insertBefore(placeholder, originalNextSibling);
    } else {
        playListElement.appendChild(placeholder);
    }

    initialTop = touch.clientY;
}

function findDropTarget(yPos) {
    let targetIndex = 0;

    Array.from(playListElement.children).forEach((child, index) => {
        if (child === draggingItem || child === placeholder) return;

        const rect = child.getBoundingClientRect();
        if (yPos >= rect.top && yPos <= rect.bottom) {
            targetIndex = index;
        }
    });

    return targetIndex;
}

function updatePlaceholderPosition(targetIndex) {
    if (placeholder) {
        playListElement.removeChild(placeholder);

        if (targetIndex < playListElement.children.length - 1) {
            playListElement.insertBefore(placeholder, playListElement.children[targetIndex]);
        } else {
            playListElement.appendChild(placeholder);
        }
    }
}

function commitDrop(targetIndex) {
    const children = Array.from(playListElement.children);
    const itemIndex = children.indexOf(draggingItem);

    if (targetIndex < 0) targetIndex = 0;
    if (targetIndex > children.length - 1) targetIndex = children.length - 1;

    if (itemIndex < targetIndex) targetIndex--;

    playListElement.insertBefore(draggingItem, playListElement.children[targetIndex]);
}

function resetDragState() {
    draggingItem.style.transform = '';
    draggingItem.classList.remove('dragging');

    if (placeholder) {
        playListElement.removeChild(placeholder);
        placeholder = null;
    }

    draggingItem = null;
}
