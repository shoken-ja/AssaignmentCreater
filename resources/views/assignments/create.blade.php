@extends('layouts.base')
@section('title', '新規プレー')

@section('content')
<div id="main">
    <!-- お絵描きエリアの設定 -->
    <div class="flex">
        <button id ="save-img-button" type="button" class="btn btn-primary" onclick="saveImg()">画像で保存</button>
        <button id ="redo-button" type="button" class="btn btn-primary" onclick="undo()">元に戻す</button>
        <button id ="undo-button" type="button" class="btn btn-primary" onclick="redo()">やり直し</button>
    </div>
    <h3 id="play-name" onclick="clickPlayName(this)">（クリックしてプレー名を編集）</h3>
    <div class="flex">
        <div id="sample" >
            <canvas id="canvas"></canvas>
        </div>
        <div id="offencePlayerInfo">

        </div>
        <div id="deffencePlayerInfo">

        </div>
    </div>


    <p id ="activeplayerName">null</p>
</div>

<!-- Fabric.jsの読み込み -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/4.5.0/fabric.min.js"></script>
<script type="text/javascript" src="{{ asset('js/context-menu.js')  }}"></script>
<script src="{{ asset('js/creater.js')  }}"></script>

</body>
</html>
@endsection
