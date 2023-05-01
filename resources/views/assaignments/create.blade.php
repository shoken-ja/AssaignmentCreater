@extends('layouts.base')
@section('title', '新規プレー')

@section('content')
<div id="main">
    <div>
        <input type="radio" id="draw" name="mode">
        <label for="draw">ペン</label>
        <input type="radio" id="erase" name="mode">
        <label for="draw">消しゴム</label>
    </div>
    <div>
        <input type="button" id="downloadPng">
    </div>
    <br>

    <!-- お絵描きエリアの設定 -->
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
