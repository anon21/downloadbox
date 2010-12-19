
var downloadStatusButton = function() {
	const Cc = Components.classes;
	const Ci = Components.interfaces;
	
	var downloadManager_ = Cc["@mozilla.org/download-manager;1"]
		.createInstance(Ci.nsIDownloadManager);
	
	var downloadStatusProgress_ = null;
	var downloadStatusProgressBar_ = null;
	var downloadStatusLabel_ = null;
	
	var registered_ = false;
	
	// アクティブなダウンロード数を表示するラベルを更新する
	function updateActiveCountLabel() {
		if( downloadManager_.activeDownloadCount == 0 ) {
			downloadStatusProgressBar_.style.height = "0px";
			downloadStatusLabel_.value = "";
		} else {
			downloadStatusLabel_.value = downloadManager_.activeDownloadCount.toString();
		}
	}
	
	// ダウンロードの進行状態を監視するためのイベントリスナ
	var downloadProgressListener_ = {
		onDownloadStateChange: function(aState, aDownload) {
			updateActiveCountLabel();
		},
		
		onProgressChange: function(aWebProgress, aRequest, aCurSelfProgress,
			aMaxSelfProgress, aCurTotalProgress, aMaxTotalProgress, aDownload) {
			
			var currentSize = 0;
			var totalSize = 0;
			var downloads = downloadManager_.activeDownloads;
			
			while( downloads.hasMoreElements() ) {
				let download = downloads.getNext().QueryInterface(Ci.nsIDownload);
				
				if( download.percentComplete < 100 && download.size > 0 ) {
					currentSize += download.amountTransferred;
					totalSize += download.size;
				}
			}
			
			if( totalSize > 0 ) {
				downloadStatusProgressBar_.style.height = Math.floor(
					downloadStatusProgress_.boxObject.height * (currentSize / totalSize)) + "px";
			}
		},
		
		onSecurityChange: function(aWebProgress, aRequest, aState, aDownload) {
		},
		
		onStateChange: function(aWebProgress, aRequest, aStateFlags, aStatus, aDownload) {
		},
	};
	
	// イベントリスナ等を登録する
	function register() {
		// 進行状態の監視
		downloadManager_.addListener(downloadProgressListener_);
		
		// フラグの更新
		registered_ = true;
	}
	
	// イベントリスト等の登録を解除する
	function unregister() {
		// 進行状態の監視の解除
		downloadManager_.removeListener(downloadProgressListener_);
		
		// フラグの更新
		registered_ = false;
	}
	
	// ツールバーボタンの状態が変更されたとき(および初期化時)呼び出されるメソッド
	function update() {
		var downloadStatusProgress = document.getElementById("download-status-progress");
		
		if( downloadStatusProgress ) {
			downloadStatusProgress_ = downloadStatusProgress;
			downloadStatusProgressBar_ = document.getElementById("download-status-progress-bar");
			downloadStatusLabel_ = document.getElementById("download-status-label");
			
			if( !registered_ )
				register();
			
			updateActiveCountLabel();
		} else {
			if( registered_ )
				unregister();
			
			downloadStatusProgress_ = null;
			downloadStatusProgressBar_ = null;
			downloadStatusLabel_ = null;
		}
	}
	
	return {
		onLoad: function() {
			update();
			
			// ツールバーボタンのカスタマイズを監視
			document.getElementById("navigator-toolbox")
				.addEventListener('dragdrop', update, false);
			
			document.getElementById("addon-bar")
				.addEventListener('dragdrop', update, false);
		},
		
		onUnload: function() {
			unregister();
			
			// ツールバーボタンのカスタマイズの監視を解除
			document.getElementById("navigator-toolbox")
				.removeEventListener('dragdrop', update, false);
			
			document.getElementById("addon-bar")
				.removeEventListener('dragdrop', update, false);
		},
	};
}();

window.addEventListener("load", downloadStatusButton.onLoad, false);
window.addEventListener("unload", downloadStatusButton.onUnload, false);
