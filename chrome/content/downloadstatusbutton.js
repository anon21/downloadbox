
var downloadStatusButton = function() {
	const Cc = Components.classes;
	const Ci = Components.interfaces;
	
	var downloadManager_ = Cc["@mozilla.org/download-manager;1"]
		.createInstance(Ci.nsIDownloadManager);
	
	var downloadStatusProgress_ = null;
	var downloadStatusProgressBar_ = null;
	var downloadStatusLabel_ = null;
	
	var registered_ = false;
	
	// ボタンの状態を更新する
	function updateDownloadStatusProgress() {
		if( downloadManager_.activeDownloadCount == 0 ) {
			// プログレスボタン用の枠線を非表示にする
			downloadStatusProgress_.className = "";
			
			// アクティブダウンロード数を非表示にする
			downloadStatusProgressBar_.style.height = "0px";
			downloadStatusLabel_.value = "";
		} else {
			// プログレスボタン用の枠線を表示する
			downloadStatusProgress_.className = "download-status-progress-on-downloading";
			
			// アクティブダウンロード数を表示する
			downloadStatusLabel_.value = downloadManager_.activeDownloadCount.toString();
		}
	}
	
	// ダウンロードの進行状態を監視するためのイベントリスナ
	var downloadProgressListener_ = {
		onDownloadStateChange: function(aState, aDownload) {
			updateDownloadStatusProgress();
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
	function registerObservation() {
		// 進行状態の監視
		downloadManager_.addListener(downloadProgressListener_);
		
		// フラグの更新
		registered_ = true;
	}
	
	// イベントリスト等の登録を解除する
	function unregisterObservation() {
		// 進行状態の監視の解除
		downloadManager_.removeListener(downloadProgressListener_);
		
		// フラグの更新
		registered_ = false;
	}
	
	// ツールバーボタンの状態が変更されたとき(および初期化時)呼び出されるメソッド
	function updateToolbarCustomization() {
		var downloadStatusProgress = document.getElementById("download-status-progress");
		
		if( downloadStatusProgress ) {
			downloadStatusProgress_ = downloadStatusProgress;
			downloadStatusProgressBar_ = document.getElementById("download-status-progress-bar");
			downloadStatusLabel_ = document.getElementById("download-status-label");
			
			downloadStatusProgressBar_.style.backgroundSize =
				"100% " + downloadStatusProgress_.boxObject.height + "px";
			
			if( !registered_ )
				registerObservation();
			
			updateDownloadStatusProgress();
		} else {
			if( registered_ )
				unregisterObservation();
			
			downloadStatusProgress_ = null;
			downloadStatusProgressBar_ = null;
			downloadStatusLabel_ = null;
		}
	}
	
	return {
		onLoad: function() {
			updateToolbarCustomization();
			
			// ツールバーボタンのカスタマイズを監視
			document.getElementById("navigator-toolbox")
				.addEventListener('dragdrop', updateToolbarCustomization, false);
			
			document.getElementById("addon-bar")
				.addEventListener('dragdrop', updateToolbarCustomization, false);
		},
		
		onUnload: function() {
			unregisterObservation();
			
			// ツールバーボタンのカスタマイズの監視を解除
			document.getElementById("navigator-toolbox")
				.removeEventListener('dragdrop', updateToolbarCustomization, false);
			
			document.getElementById("addon-bar")
				.removeEventListener('dragdrop', updateToolbarCustomization, false);
		},
	};
}();

window.addEventListener("load", downloadStatusButton.onLoad, false);
window.addEventListener("unload", downloadStatusButton.onUnload, false);
