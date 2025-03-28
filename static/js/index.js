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
    onMove: function (/**Event*/evt) {
        document.querySelectorAll('.sortable-drag').forEach(element => {
            const style = getComputedStyle(element);
            const matrix = style.transform.match(/matrix\(([^)]+)\)/);

            if (matrix) {
                const params = matrix[1].split(',').map(Number);
                // 修改第5个参数（e）为0（索引从0开始）
                params[4] = 0;
                element.style.transform = `matrix(${params.join(',')})`;
            }
        });
    },
    onEnd: function (/**Event*/evt) {
        console.log("结束拖动")
    },
});
