@extends('layouts.base')
@section('title', 'アサイメント 管理')

@section('content')
        <div class="container">
            <h1>アサイメント 管理</h1>
            <div class="row mt-5 mb-3">
                <div class="col text-right">
                <a href="./create" type="button" class="btn btn-primary">追加</a>
                </div>
            </div>
            <div class="row my-3">
                <table class="table" id="quizzes-table">
                    <thead class="thead-light">
                        <tr>
                            <th scope="col" style="width:10%">#</th>
                            <th scope="col">問題</th>
                            <th scope="col" style="width:10%">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th scope="row">1</th>
                            <td><a href="./show">問題1問題1問題1</a></td>
                            <td><button type="button" class="delete-quiz btn btn-danger btn-sm">削除</button></td>
                        </tr>
                        <tr>
                            <th scope="row">2</th>
                            <td><a href="./show">問題2問題2問題2</a></td>
                            <td><button type="button" class="delete-quiz btn btn-danger btn-sm">削除</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </body>
</html>
@endsection
