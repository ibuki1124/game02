const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const size = 8; //縦横のサイズ（8*8）
const cell = 50; //1つのセルのサイズ
const b = 'b'; //黒石
const w = 'w'; //白石
const nullCell = ''; //空のセル
let currentPlayer = b; // 先攻は黒
let b_count = document.getElementById("b-count"); //黒石のカウント
let w_count = document.getElementById("w-count"); //白石のカウント
let num_b, num_w; //置かれている黒白石の数の個数
let drawMarkRadius = 20; //黒白石のサイズ
let text = document.getElementById("text"); //ゲームステータスの表示
let current = document.getElementById("current"); //ゲームステータスの表示

// 盤面の描画
function drawBoard() {
  if (canvas.getContext){
    let rectangle = new Path2D();
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++){
        rectangle.rect(j * cell, i * cell, 100, 100);
      }
    }
    ctx.fillStyle = "green";
    ctx.fill(rectangle);
    ctx.lineWidth = 2;
    ctx.stroke(rectangle);
    // セルに合わせた配列
    board = [];
    for (let y = 0; y < size; y++) {
        board.push([]);
        for (let x = 0; x < size; x++) {
            board[y][x] = nullCell;
        }
    }

    // // 初期の黒白石の配置
    drawMark(3, 3, w);
    drawMark(4, 3, b);
    drawMark(4, 4, w);
    drawMark(3, 4, b);
  }
}

// 黒白石の描画
function drawMark(x, y, mark) {
  if (mark == b){
    // 黒石の描画
    ctx.beginPath();
    ctx.arc(x * cell + 25, y * cell + 25, drawMarkRadius, 0, 2 * Math.PI);
    ctx.fillStyle = "black"
    ctx.fill();
  }else if (mark == w){
    // 白石の描画
    ctx.beginPath();
    ctx.arc(x * cell + 25, y * cell + 25, drawMarkRadius, 0, 2 * Math.PI);
    ctx.fillStyle = "white"
    ctx.fill();
  }

  board[y][x] = mark;

  num_b = 0;
  num_w = 0;
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (board[i][j] == b){
        num_b++;
        // 黒石カウントが描画される
        b_count.innerHTML = `${num_b}`;
      }else if (board[i][j] == w){
        num_w++;
        // 白石カウントが描画される
        w_count.innerHTML = `${num_w}`;
      }
    }
  }
}

// パスされたかどうか判定
let pass; //置ける場所の数
function isPass(radius, color){
    pass = 0
    for (let i = 0; i < size; i++){
        for (let j = 0; j < size; j++){
            if (notDraw(j, i, currentPlayer) === true){
                pass++;
                drawTrueMark(j, i, radius, color);
            }
        }
    }
}

// 置けるセルの表示
function drawTrueMark(x, y, radius, color){
    ctx.beginPath();
    ctx.arc(x * cell + 25, y * cell + 25, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
}

let isGameStarted = false; // ゲーム開始フラグ

// 開始ボタン
document.getElementById('start').addEventListener('click', startGame);
function startGame() {
    alert("ゲームを開始します");
    // 開始ボタン無効化
    document.getElementById('start').disabled = true;
    isGameStarted = true; // ゲーム開始フラグを立てる
    isPass(5, "white");
    text.innerText = "現在のターン";
    current.innerText = "●";
}

// 盤面クリック時の描画
canvas.addEventListener('click', (event) => {
  if (isGameStarted == false) {
      return; // ゲーム未開始時は無効
  }

  const x = Math.floor(event.offsetX / cell); //横のセルの位置の取得
  const y = Math.floor(event.offsetY / cell); //縦のセルの位置の取得

  if (board[y][x] === '') {
    isPass(6, "green");
    if (checkCell(x, y, currentPlayer) === true){
      reverse(x, y, currentPlayer);
      // プレイヤーを入れ替える
      currentPlayer = currentPlayer == b ? w : b;
      if (currentPlayer == b){
        current.className = "text-body h1"
      }else if (currentPlayer == w){
        current.className = "text-light h1"
      }
    }

    // 勝利判定
    if (checkWinner() == true){
        return;
    }else{
        // 強制終了判定
        isPass(5, "white");
        if (pass === 0){
            alert("置けるマスがないためパスされました");
            currentPlayer = currentPlayer == b ? w : b;
            if (currentPlayer == b){
              current.className = "text-body h1"
            }else if (currentPlayer == w){
              current.className = "text-light h1"
            }
            isPass(5, "white");
            if (pass === 0){
                alert("両者とも置けるマスがないためゲームを終了します。");
                isGameOver();
            }
        }
    }
  }
});

//反転判定
function reverse(x, y, currentPlayer){
    reverseUp(x, y, currentPlayer); //上の判定
    reverseLow(x, y, currentPlayer); //下の判定
    reverseLeft(x, y, currentPlayer); //左の判定
    reverseRight(x, y, currentPlayer); //右の判定
    reverseLeftUp(x, y, currentPlayer); //左上の判定
    reverseRightLow(x, y, currentPlayer); //右下の判定
    reverseRightUp(x, y, currentPlayer); //右上の判定
    reverseLeftLow(x, y, currentPlayer); //左下の判定
}

// 上方向の反転
function reverseUp(x, y, color) {
    // 現在の位置が1列目であれば上には存在しないので処理を終了
    if (y == 0){
        return null;
    }

    // 現在の位置と同じ色
    let target;
    // 1つ上のマス
    let Up = y - 1;

    if (board[Up][x] == color || board[Up][x] == nullCell){
        return null;
    }
    // 現在の位置より上方向を自分の色に上書きする
    // Up--は現在の位置の2つ上
    for (Up--; Up >= 0; Up--){
        if (board[Up][x] == nullCell || board[Up][x] == null){
            return null;
        }else if (board[Up][x] == color){
            target = Up;
            for (let i = y; i >= target; i--){
                drawMark(x, i, color);
            }
            return true;
        }
    }
}

// 下方向の反転
function reverseLow(x, y, color) {
    // 現在の位置が7列目であれば下には存在しないので処理を終了
    if (y == 7){
        return null;
    }

    // 現在の位置と同じ色
    let target;
    // 1つ下のマス
    let Low = y + 1;

    if (board[Low][x] == color || board[Low][x] == nullCell){
        return null;
    }
    // 現在の位置より下方向を自分の色に上書きする
    // Low++は現在の位置の2つ下
    for (Low++; Low <= 7; Low++){
        if (board[Low][x] == nullCell || board[Low][x] == null){
            return null;
        }else if (board[Low][x] == color){
            target = Low;
            for (let i = y; i <= target; i++){
                drawMark(x, i, color);
            }
            return true;
        }
    }
}

// 左方向の反転
function reverseLeft(x, y, color){
    // 現在の位置が1行目であれば左には存在しないので処理を終了
    if (x == 0){
        return null;
    }

    // 現在の位置と同じ色
    let target;
    // 1つ左のマス
    let Left = x - 1;

    if (board[y][Left] == color || board[y][Left] == nullCell){
        return null;
    }
    // 現在の位置より左方向を自分の色に上書きする
    // Left--は現在の位置の2つ左
    for (Left--; Left >= 0; Left--){
        if (board[y][Left] == nullCell || board[y][Left] == null){
            return null;
        }else if (board[y][Left] == color){
            target = Left;
            for (let i = x; i >= target; i--){
                drawMark(i, y, color);
            }
            return true;
        }
    }
}

// 右方向の反転
function reverseRight(x, y, color) {
    // 現在の位置が7行目であれば右には存在しないので処理を終了
    if (x == 7){
        return null;
    }

    // 現在の位置と同じ色
    let target;
    // 1つ右のマス
    let Right = x + 1;

    if (board[y][Right] == color || board[y][Right] == nullCell){
        return null;
    }
    // 現在の位置より右方向を自分の色に上書きする
    // Right++は現在の位置の2つ右
    for (Right++; Right <= 7; Right++){
        if (board[y][Right] == nullCell || board[y][Right] == null){
            return null;
        }else if (board[y][Right] == color){
            target = Right;
            for (let i = x; i <= target; i++){
                drawMark(i, y, color);
            }
            return true;
        }
    }
}

// 左上の反転
function reverseLeftUp(x, y, color){
    // 現在の位置が1行1列目であれば左上には存在しないので処理を終了
    if (x == 0 || y == 0){
        return null;
    }

    // 現在の位置と同じ色
    let targetUp;
    let targetLeft;
    // 1つ左上のマス
    let Left = x - 1;
    let Up = y - 1;

    if (board[Up][Left] == color || board[Up][Left] == nullCell){
        return null;
    }
    // 現在の位置より左上方向を自分の色に上書きする
    // Up--, Left--は現在の位置の2つ左上
    for (Up--, Left--; Up >= 0 && Left >= 0; Up--, Left--){
        if (board[Up][Left] == nullCell || board[Up][Left] == null){
            return null;
        }else if (board[Up][Left] == color){
            targetUp = Up;
            targetLeft = Left;
            for (let i = x, j = y; i >= targetLeft, j >= targetUp; i--, j--){
                drawMark(i, j, color);
            }
            return true;
        }
    }
}

// 右下の反転
function reverseRightLow(x, y, color){
    // 現在の位置が7行7列目であれば右下には存在しないので処理を終了
    if (x == 7 || y == 7){
        return null;
    }

    // 現在の位置と同じ色
    let targetLow;
    let targetRight;
    // 1つ右下のマス
    let Right = x + 1;
    let Low = y + 1;

    if (board[Low][Right] == color || board[Low][Right] == nullCell){
        return null;
    }
    // 現在の位置より右下方向を自分の色に上書きする
    // Low++, Right++は現在の位置の2つ右下
    for (Low++, Right++; Low <= 7 && Right <= 7; Low++, Right++){
        if (board[Low][Right] == nullCell || board[Low][Right] == null){
            return null;
        }else if (board[Low][Right] == color){
            targetLow = Low;
            targetRight = Right;
            for (let i = x, j = y; i <= targetRight, j <= targetLow; i++, j++){
                drawMark(i, j, color);
            }
            return true;
        }
    }
}

// 右上の反転
function reverseRightUp(x, y, color){
    // 現在の位置が7行1列目であれば右上には存在しないので処理を終了
    if (x == 7 || y == 0){
        return null;
    }

    // 現在の位置と同じ色
    let targetUp;
    let targetRight;
    // 1つ右上のマス
    let Right = x + 1;
    let Up = y - 1;

    if (board[Up][Right] == color || board[Up][Right] == nullCell){
        return null;
    }
    // 現在の位置より右上方向を自分の色に上書きする
    // Up--, Right++は現在の位置の2つ右上
    for (Up--, Right++; Up >= 0 && Right <= 7; Up--, Right++){
        if (board[Up][Right] == nullCell || board[Up][Right] == null){
            return null;
        }else if (board[Up][Right] == color){
            targetUp = Up;
            targetRight = Right;
            for (let i = x, j = y; i <= targetRight, j >= targetUp; i++, j--){
                drawMark(i, j, color);
            }
            return true;
        }
    }
}

// 左下の反転
function reverseLeftLow(x, y, color){
    // 現在の位置が1行7列目であれば左下には存在しないので処理を終了
    if (x == 0 || y == 7){
        return null;
    }

    // 現在の位置と同じ色
    let targetLow;
    let targetLeft;
    // 1つ左下のマス
    let Left = x - 1;
    let Low = y + 1;

    if (board[Low][Left] == color || board[Low][Left] == nullCell){
        return null;
    }
    // 現在の位置より左下方向を自分の色に上書きする
    // Low++, Left--は現在の位置の2つ左下
    for (Low++, Left--; Low <= 7 && Left >= 0; Low++, Left--){
        if (board[Low][Left] == nullCell || board[Low][Left] == null){
            return null;
        }else if (board[Low][Left] == color){
            targetLow = Low;
            targetLeft = Left;
            for (let i = x, j = y; i >= targetLeft, j <= targetLow; i--, j++){
                drawMark(i, j, color);
            }
            return true;
        }
    }
}

// 相手セルの反転判定
function checkCell(x, y, currentPlayer){
  if (reverseUp(x, y, currentPlayer)  != null){
    return true;
  }else if (reverseLow(x, y, currentPlayer) != null){
    return true;
  }else if (reverseLeft(x, y, currentPlayer) != null){
    return true;
  }else if (reverseRight(x, y, currentPlayer) != null){
    return true;
  }else if (reverseLeftUp(x, y, currentPlayer) != null){
    return true;
  }else if (reverseRightLow(x, y, currentPlayer) != null){
    return true;
  }else if (reverseRightUp(x, y, currentPlayer) != null){
    return true;
  }else if (reverseLeftLow(x, y, currentPlayer) != null){
    return true;
  }else{
    return false;
  }
}

// 上方向
function reverseUp_noDraw(x, y, color) {
    if (board[y][x] != nullCell){
        return null;
    }
    // 現在の位置が1列目であれば上には存在しないので処理を終了
    if (y == 0){
      return null;
    }

    // 1つ上のマス
    let Up = y - 1;

    if (board[Up][x] == color || board[Up][x] == nullCell){
        return null;
    }
    // 現在の位置より上方向を自分の色に上書きする
    // Up--は現在の位置の2つ上
    for (Up--; Up >= 0; Up--){
        if (board[Up][x] == nullCell || board[Up][x] == null){
            return null;
        }else if (board[Up][x] == color){
            return true;
        }
    }
}

// 下方向
function reverseLow_noDraw(x, y, color) {
    if (board[y][x] != nullCell){
        return null;
    }
   // 現在の位置が7列目であれば下には存在しないので処理を終了
   if (y == 7){
    return null;
    }

    // 1つ下のマス
    let Low = y + 1;

    if (board[Low][x] == color || board[Low][x] == nullCell){
        return null;
    }
    // 現在の位置より下方向を自分の色に上書きする
    // Low++は現在の位置の2つ下
    for (Low++; Low <= 7; Low++){
        if (board[Low][x] == nullCell || board[Low][x] == null){
            return null;
        }else if (board[Low][x] == color){
            return true;
        }
    }
}

// 左方向
function reverseLeft_noDraw(x, y, color){
    if (board[y][x] != nullCell){
        return null;
    }
    // 現在の位置が1行目であれば左には存在しないので処理を終了
    if (x == 0){
      return null;
    }

    // 1つ左のマス
    let Left = x - 1;

    if (board[y][Left] == color || board[y][Left] == nullCell){
        return null;
    }
    // 現在の位置より左方向を自分の色に上書きする
    // Left--は現在の位置の2つ左
    for (Left--; Left >= 0; Left--){
        if (board[y][Left] == nullCell || board[y][Left] == null){
            return null;
        }else if (board[y][Left] == color){
            return true;
        }
    }
}

// 右方向
function reverseRight_noDraw(x, y, color) {
    if (board[y][x] != nullCell){
        return null;
    }
    // 現在の位置が7行目であれば右には存在しないので処理を終了
    if (x == 7){
        return null;
    }

    // 1つ右のマス
    let Right = x + 1;

    if (board[y][Right] == color || board[y][Right] == nullCell){
        return null;
    }
    // 現在の位置より右方向を自分の色に上書きする
    // Right++は現在の位置の2つ右
    for (Right++; Right <= 7; Right++){
        if (board[y][Right] == nullCell || board[y][Right] == null){
            return null;
        }else if (board[y][Right] == color){
            return true;
        }
    }
}

// 左上方向
function reverseLeftUp_noDraw(x, y, color){
    if (board[y][x] != nullCell){
        return null;
    }
    // 現在の位置が1行1列目であれば左上には存在しないので処理を終了
    if (x == 0 || y == 0){
      return null;
    }

  // 1つ左上のマス
  let Left = x - 1;
  let Up = y - 1;

  if (board[Up][Left] == color || board[Up][Left] == nullCell){
      return null;
  }
  // 現在の位置より左上方向を自分の色に上書きする
  // Up--, Left--は現在の位置の2つ左上
  for (Up--, Left--; Up >= 0 && Left >= 0; Up--, Left--){
      if (board[Up][Left] == nullCell || board[Up][Left] == null){
        return null;
      }else if (board[Up][Left] == color){
        return true;
      }
  }
}

// 右下方向
function reverseRightLow_noDraw(x, y, color){
    if (board[y][x] != nullCell){
        return null;
    }
   // 現在の位置が7行7列目であれば右下には存在しないので処理を終了
   if (x == 7 || y == 7){
        return null;
    }

    // 1つ右下のマス
    let Right = x + 1;
    let Low = y + 1;

    if (board[Low][Right] == color || board[Low][Right] == nullCell){
        return null;
    }
    // 現在の位置より右下方向を自分の色に上書きする
    // Low++, Right++は現在の位置の2つ右下
    for (Low++, Right++; Low <= 7 && Right <= 7; Low++, Right++){
        if (board[Low][Right] == nullCell || board[Low][Right] == null){
            return null;
        }else if (board[Low][Right] == color){
            return true;
        }
    }
}

// 右上方向
function reverseRightUp_noDraw(x, y, color){
    if (board[y][x] != nullCell){
        return null;
    }
    // 現在の位置が7行1列目であれば右上には存在しないので処理を終了
    if (x == 7 || y == 0){
        return null;
    }

    // 1つ右上のマス
    let Right = x + 1;
    let Up = y - 1;

    if (board[Up][Right] == color || board[Up][Right] == nullCell){
        return null;
    }
    // 現在の位置より右上方向を自分の色に上書きする
    // Up--, Right++は現在の位置の2つ右上
    for (Up--, Right++; Up >= 0 && Right <= 7; Up--, Right++){
        if (board[Up][Right] == nullCell || board[Up][Right] == null){
            return null;
        }else if (board[Up][Right] == color){
            return true;
        }
    }
}

// 左下方向
function reverseLeftLow_noDraw(x, y, color){
  if (board[y][x] != nullCell){
    return null;
  }
  // 現在の位置が1行7列目であれば左下には存在しないので処理を終了
  if (x == 0 || y == 7){
      return null;
  }

  // 1つ左下のマス
  let Left = x - 1;
  let Low = y + 1;

  if (board[Low][Left] == color || board[Low][Left] == nullCell){
      return null;
  }
  // 現在の位置より左下方向を自分の色に上書きする
  // Low++, Left--は現在の位置の2つ左下
  for (Low++, Left--; Low <= 7 && Left >= 0; Low++, Left--){
      if (board[Low][Left] == nullCell || board[Low][Left] == null){
          return null;
      }else if (board[Low][Left] == color){
        return true;
      }
  }
}

// 置ける場所がどこなのか判定
function notDraw(x, y, currentPlayer){
  if ((reverseUp_noDraw(x, y, currentPlayer)  === true) ||
      (reverseLow_noDraw(x, y, currentPlayer) === true) ||
      (reverseLeft_noDraw(x, y, currentPlayer) === true) ||
      (reverseRight_noDraw(x, y, currentPlayer) === true) ||
      (reverseLeftUp_noDraw(x, y, currentPlayer) === true) ||
      (reverseRightLow_noDraw(x, y, currentPlayer) === true) ||
      (reverseRightUp_noDraw(x, y, currentPlayer) === true) ||
      (reverseLeftLow_noDraw(x, y, currentPlayer) === true)
    ){
        return true
    }
    return false;
}

// ゲーム途中終了判定
function isGameOver(){
    isGameStarted = false;
    text.innerText = "ゲームが終了しました";
    current.innerText = null;
    if (num_b > num_w){
      // 黒の勝利
      alert(`黒の勝ちです！`);
      win_count.innerHTML += `<p class="m-auto border-bottom">${win}戦目<span class="h3 text-body ml-2">●</span><span class="text-danger font-weight-bold">${num_b}</span>：<span class="h3 text-light">●</span><span class="text-danger font-weight-bold mr-3">${num_w}</span>黒の勝利</p>`
      win++;
      return true;
    }else if (num_w > num_b){
      // 白の勝利
      alert(`白の勝ちです！`);
      win_count.innerHTML += `<p class="m-auto border-bottom">${win}戦目<span class="h3 text-body ml-2">●</span><span class="text-danger font-weight-bold">${num_b}</span>：<span class="h3 text-light">●</span><span class="text-danger font-weight-bold mr-3">${num_w}</span>白の勝利</p>`
      win++;
      return true;
    }else if (num_b == num_w){
      // 引き分け
      alert(`引き分けです！`);
      win_count.innerHTML += `<p class="m-auto border-bottom">${win}戦目<span class="ml-2">引き分け</span></p>`
      win++;
      return true;
    }
}

let winPlayer; //勝利したプレイヤー
let win = 1; //勝敗の数
let win_count = document.getElementById("win-count"); //勝負の回数

// 勝敗判定
function checkWinner() {
  // すべてのマスにマークが置かれているかどうかを確認
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (board[i][j] === nullCell) {
        return false; // 空白マスがあれば、まだゲーム終了ではない
      }
    }
  }
  isGameOver();
  return true;
}

// ゲームリセットボタン
document.getElementById("reset").addEventListener("click", resetGame);
function resetGame() {
  let Com = confirm('ゲームをリセットしますか？');

  if (Com == true){
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    text.innerText = "ゲームが開始していません";
    current.innerText = null;

    // currentPlayer 変数を初期化（先攻にする）
    currentPlayer = b;

    // 盤面を再描画
    drawBoard();

    // 開始ボタン有効化
    document.getElementById('start').disabled = false;

    // ゲーム開始フラグを解除
    isGameStarted = false;
  }
}