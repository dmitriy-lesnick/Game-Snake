// Глобальные переменные:                            
let FIELD_SIZE_X = 20;//строки
let FIELD_SIZE_Y = 20;//столбцы
let SNAKE_SPEED = 200; // Интервал между перемещениями змейки
let snake = []; // Сама змейка
let direction = 'y+'; // Направление движения змейки
let gameIsRunning = false; // Запущена ли игра
let snake_timer; // Таймер змейки
let food_timer; // Таймер для еды
let score = 0; // Результат

let record = 0;
let newRecord = document.querySelector('.record');


if (localStorage.getItem('record')) {
    record = JSON.parse(localStorage.getItem('record'));
    newRecord.innerText = ' ' + record
}


function init() {
    prepareGameField(); // Генерация поля

    let wrap = document.getElementsByClassName('wrap')[0];
    // Подгоняем размер контейнера под игровое поле

    /*
    if (16 * (FIELD_SIZE_X + 1) < 380) {
        wrap.style.width = '380px';
    }
    else {
        wrap.style.width = (16 * (FIELD_SIZE_X + 1)).toString() + 'px';
    }
    */


    wrap.style.width = '1000px';
    // События кнопок Старт и Новая игра
    document.getElementById('snake-start').addEventListener('click', startGame);
    document.getElementById('snake-renew').addEventListener('click', refreshGame);

    // Отслеживание клавиш клавиатуры
    addEventListener('keydown', changeDirection);
}

/**
 * Функция генерации игрового поля
 */
function prepareGameField() {
    // Создаём таблицу
    let game_table = document.createElement('table');
    game_table.setAttribute('class', 'game-table ');

    // Генерация ячеек игровой таблицы
    for (let i = 0; i < FIELD_SIZE_X; i++) {
        // Создание строки
        let row = document.createElement('tr');
        row.className = 'game-table-row row-' + i;

        for (let j = 0; j < FIELD_SIZE_Y; j++) {
            // Создание ячейки
            let cell = document.createElement('td');
            cell.className = 'game-table-cell cell-' + i + '-' + j;

            row.appendChild(cell); // Добавление ячейки
        }
        game_table.appendChild(row); // Добавление строки
    }

    document.getElementById('snake-field').appendChild(game_table); // Добавление таблицы
}

/**
 * Старт игры
 */
function startGame() {
    gameIsRunning = true;
    let audioStart = document.querySelector('.audio-start');
    audioStart.play();
    audioStart.volume = 0.25;
    respawn();//создали змейку
    snake_timer = setInterval(move, SNAKE_SPEED);//каждые 200мс запускаем функцию move
    setTimeout(createFood, 1000);
    setTimeout(createBomb, 1000);
    this.classList.add('display-none');
    document.querySelector('.score-wrp').classList.remove('display-none');
    document.querySelector('.score').innerText = 0;
}


/**
 * Функция расположения змейки на игровом поле
 */
function respawn() {
    // Змейка - массив td
    // Стартовая длина змейки = 2

    // Respawn змейки из центра
    let start_coord_x = Math.floor(FIELD_SIZE_X / 2);
    let start_coord_y = Math.floor(FIELD_SIZE_Y / 2);

    // Голова змейки
    let snake_head = document.getElementsByClassName('cell-' + start_coord_y + '-' + start_coord_x)[0];
    snake_head.setAttribute('class', snake_head.getAttribute('class') + ' snake-unit');
    // Тело змейки
    let snake_tail = document.getElementsByClassName('cell-' + (start_coord_y - 1) + '-' + start_coord_x)[0];
    snake_tail.setAttribute('class', snake_tail.getAttribute('class') + ' snake-unit');

    snake.push(snake_head);
    snake.push(snake_tail);
}




/**
 * Движение змейки
 */
function move() {
    //console.log('move',direction);
    // Сборка классов
    let snake_head_classes = snake[snake.length - 1].getAttribute('class').split(' ');

    // Сдвиг головы
    let new_unit;
    let snake_coords = snake_head_classes[1].split('-');//преобразовали строку в массив
    let coord_y = parseInt(snake_coords[1]);
    let coord_x = parseInt(snake_coords[2]);

    // Определяем новую точку
    if (direction == 'x-') {
        new_unit = document.getElementsByClassName('cell-' + (coord_y) + '-' + (coord_x - 1))[0];
    }
    else if (direction == 'x+') {
        new_unit = document.getElementsByClassName('cell-' + (coord_y) + '-' + (coord_x + 1))[0];
    }
    else if (direction == 'y+') {
        new_unit = document.getElementsByClassName('cell-' + (coord_y - 1) + '-' + (coord_x))[0];
    }
    else if (direction == 'y-') {
        new_unit = document.getElementsByClassName('cell-' + (coord_y + 1) + '-' + (coord_x))[0];
    }

    ///////////
    if (new_unit == undefined) {
        switch (direction) {
            case 'x-':
                new_unit = document.getElementsByClassName('cell-' + (coord_y) + '-' + (FIELD_SIZE_X - 1))[0];
                break;
            case 'x+':
                new_unit = document.getElementsByClassName('cell-' + (coord_y) + '-' + (0))[0];
                break;
            case 'y+':
                new_unit = document.getElementsByClassName('cell-' + (FIELD_SIZE_Y - 1) + '-' + (coord_x))[0];
                break;
            case 'y-':
                new_unit = document.getElementsByClassName('cell-' + (0) + '-' + (coord_x))[0];
                break;
        }
    }

    /////////////


    // Проверки
    // 1) new_unit не часть змейки и не бомба
    // 2) Змейка не ушла за границу поля
    //console.log(new_unit);
    if (!isSnakeUnit(new_unit) && !isBombUnit(new_unit)) {
        // Добавление новой части змейки
        new_unit.setAttribute('class', new_unit.getAttribute('class') + ' snake-unit');
        snake.push(new_unit);

        // Проверяем, надо ли убрать хвост
        if (!haveFood(new_unit)) {
            // Находим хвост
            let removed = snake.splice(0, 1)[0];
            let classes = removed.getAttribute('class').split(' ');

            // удаляем хвост
            removed.setAttribute('class', classes[0] + ' ' + classes[1]);
        }

    }
    else {
        let soundGameOver = document.querySelector('.audio-game-over')
        soundGameOver.play();
        soundGameOver.volume = 0.5;
        finishTheGame();
    }

    //если бонус
    if (haveBonus(new_unit)) {
        document.querySelector('.bonus-unit').classList.remove('bonus-unit')
        score = score + 10;
        document.querySelector('.score').innerText = score;
    }

}

/**
 * Проверка на змейку
 * @param unit
 * @returns {boolean}
 */
function isSnakeUnit(unit) {//проверка, что змейка не попала сама в себя в новой ячейке
    let check = false;

    if (snake.includes(unit)) {//если в змейке содержится новая ячейка, значит возникло пересечение
        check = true;
    }
    return check;
}

/**
 * Проверка на бомбу
 * @param unit
 * @returns {boolean}
 */
function isBombUnit(unit) {
    let check = false;
    let unit_classes = unit.getAttribute('class').split(' ');
    if (unit_classes.includes('bomb-unit')) {
        check = true;
    }
    return check;
}

/**
 * проверка на еду
 * @param unit
 * @returns {boolean}
 */
function haveFood(unit) {
    let check = false;

    let unit_classes = unit.getAttribute('class').split(' ');

    // Если еда
    if (unit_classes.includes('food-unit')) {
        check = true;
        document.querySelector('.audio-food').play()
        document.querySelector('.food-unit').classList.remove('food-unit')
        createFood();
        createBomb();
        score++;
        // проверка на счет для создания бонуса 
        if (score == 5 || score == 30 || score == 50 || score == 70) {
            document.querySelector('.bonus').play();
            document.querySelector('.bonus').volume = 0.5;
            createBonus()
        }

        document.querySelector('.score').innerText = score;
    }
    return check;
}

/**
 * Создание еды
 */
function createFood() {
    let foodCreated = false;

    while (!foodCreated) { //пока еду не создали
        // рандом
        let food_x = Math.floor(Math.random() * FIELD_SIZE_X);
        let food_y = Math.floor(Math.random() * FIELD_SIZE_Y);

        let food_cell = document.getElementsByClassName('cell-' + food_y + '-' + food_x)[0];
        let food_cell_classes = food_cell.getAttribute('class').split(' ');

        // проверка на змейку бомбу бонус
        if (!food_cell_classes.includes('snake-unit') && !food_cell_classes.includes('bomb-unit') && !food_cell_classes.includes('bonus-unit')) {
            let classes = '';
            for (let i = 0; i < food_cell_classes.length; i++) {
                classes += food_cell_classes[i] + ' ';
            }

            food_cell.setAttribute('class', classes + 'food-unit');
            foodCreated = true;
        }
    }
}

//проверка на бонус 

function haveBonus(unit) {
    let check = false;

    let unit_classes = unit.getAttribute('class').split(' ');

    // Если бонус
    if (unit_classes.includes('bonus-unit')) {
        check = true;
        document.querySelector('.pick-up-bonus').play();
        document.querySelector('.pick-up-bonus').volume = 0.5;
    }
    return check;
}

// создание бонуса
function createBonus() {
    let bonusCreated = false;

    while (!bonusCreated) { //пока бонус не создали
        // рандом
        let bonus_x = Math.floor(Math.random() * FIELD_SIZE_X);
        let bonus_y = Math.floor(Math.random() * FIELD_SIZE_Y);

        let bonus_cell = document.getElementsByClassName('cell-' + bonus_y + '-' + bonus_x)[0];
        let bonus_cell_classes = bonus_cell.getAttribute('class').split(' ');

        // проверка на змейку еду бомбу
        if (!bonus_cell_classes.includes('snake-unit') && !bonus_cell_classes.includes('bomb-unit') && !bonus_cell_classes.includes('food-unit')) {
            let classes = '';
            for (let i = 0; i < bonus_cell_classes.length; i++) {
                classes += bonus_cell_classes[i] + ' ';
            }

            bonus_cell.setAttribute('class', classes + 'bonus-unit');
            bonusCreated = true;
        }
    }
}


//создание бомб

function createBomb() {
    let bombCreated = false;

    while (!bombCreated) { //пока бомбу не создали
        // рандом
        let bomb_x = Math.floor(Math.random() * ((FIELD_SIZE_X - 1) - 1) + 1);
        let bomb_y = Math.floor(Math.random() * ((FIELD_SIZE_Y - 1) - 1) + 1);

        let bomb_cell = document.getElementsByClassName('cell-' + bomb_y + '-' + bomb_x)[0];
        let bomb_cell_classes = bomb_cell.getAttribute('class').split(' ');

        // проверка на змейку еду бонус
        if (!bomb_cell_classes.includes('snake-unit') && !bomb_cell_classes.includes('food-unit') && !bomb_cell_classes.includes('bonus-unit')) {
            let classes = '';
            for (let i = 0; i < bomb_cell_classes.length; i++) {
                classes += bomb_cell_classes[i] + ' ';
            }

            bomb_cell.setAttribute('class', classes + 'bomb-unit');
            bombCreated = true;
        }
    }
}

/**
 * Изменение направления движения змейки
 * @param e - событие
 */
function changeDirection(e) {

    switch (e.keyCode) {
        case 37: // Клавиша влево
            if (direction != 'x+') {
                direction = 'x-'
            }
            break;
        case 38: // Клавиша вверх
            if (direction != 'y-') {
                direction = 'y+'
            }
            break;
        case 39: // Клавиша вправо
            if (direction != 'x-') {
                direction = 'x+'
            }
            break;
        case 40: // Клавиша вниз
            if (direction != 'y+') {
                direction = 'y-'
            }
            break;
    }
}



/**
 * Функция завершения игры
 */
function finishTheGame() {
    gameIsRunning = false;
    clearInterval(snake_timer);
    let scoreGameOver = document.querySelector('.score-game-over');
    scoreGameOver.classList.add('margin');
    scoreGameOver.innerText = 'Вы проиграли, общее колличество очков - ' + score;
    document.querySelector('#snake-renew').classList.remove('display-none');
    document.querySelector('.score-wrp').classList.add('display-none')
    if (score > record) {
        newRecord.innerText = ' ' + score;
        localStorage.setItem('record', JSON.stringify(score))
    }

}

/**
 * Новая игра
 */
function refreshGame() {
    location.reload();
}

// Инициализация
window.onload = init;