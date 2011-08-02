
var DownloadBox = function() {
	const Cc = Components.classes;
	const Ci = Components.interfaces;
	
	var downloadManager_ = Cc["@mozilla.org/download-manager;1"]
		.createInstance(Ci.nsIDownloadManager);
	
	var button_ = null; // ボタン
	var progress_ = null; // ボタンのプログレス
	var progressBar_ = null; // ボタンのプログレスのバー部分
	var label_ = null; // ボタンのラベル
	
	var intervalID_ = null; // setInterval()のID
	
	var showDownloadCount_ = true; // ダウンロード数を表示するかどうか
	var showDownloadProgress_ = true; // プログレスを表示するかどうか
	
	// オブジェクトの空判定
	function objectIsEmpty(obj) {
		for(var a in obj)
			return false;
		
		return true;
	}
	
	// ボタン・ポップアップの更新
	function updateUIState() {
		var downloads = downloadManager_.activeDownloads;
		var downloadCount = 0;
		var downloadedSize = 0;
		var totalDownloadSize = 0;
		var isPaused = true;
		
		while( downloads.hasMoreElements() ) {
			var download = downloads.getNext().QueryInterface(Ci.nsIDownload);
			
			switch( download.state ) {
			case Ci.nsIDownloadManager.DOWNLOAD_DOWNLOADING:
			case Ci.nsIDownloadManager.DOWNLOAD_QUEUED:
				isPaused = false;
			case Ci.nsIDownloadManager.DOWNLOAD_PAUSED:
				if( download.percentComplete < 100 && download.size > 0 ) {
					// ダウンロード情報の更新
					++downloadCount;
					
					downloadedSize += download.amountTransferred;
					totalDownloadSize += download.size;
				}
				
				break;
			}
		}
		
		// 更新が必要かチェック
		var shouldUpdateProgressBar = false;
		var shouldUpdateLabel = false;
		
		if( button_ && downloadCount >= 1 ) {
			if( showDownloadProgress_ )
				shouldUpdateProgressBar = true;
			
			if( showDownloadCount_ )
				shouldUpdateLabel = true;
		} else {
			window.clearInterval(intervalID_);
			intervalID_ = null;
		}
		
		// プログレスを更新
		if( shouldUpdateProgressBar ) {
			if( isPaused ) {
				progressBar_.className = "downloadbox-progress-bar-paused";
			} else {
				progressBar_.className = "";
			}
			
			progress_.className = "downloadbox-progress-downloading";
			progressBar_.style.height = (Math.floor(progress_.boxObject.height *
				(downloadedSize / totalDownloadSize))).toString() + "px";
		} else {
			progress_.className = "";
			progressBar_.style.height = "0px";
		}
		
		// ラベルを更新
		if( shouldUpdateLabel ) {
			label_.value = downloadCount.toString();
		} else {
			label_.value = "";
		}
	}
	
	// ダウンロードのイベントリスナ
	var downloadProgressListener_ = {
		onDownloadStateChange: function(aState, aDownload) {
			switch( aState ) {
			case Ci.nsIDownloadManager.DOWNLOAD_QUEUED:
				{
					// タイマーが設定されていなければ設定する
					if( intervalID_ == null )
						intervalID_ = window.setInterval(updateUIState, 1000);
				}
				break;
			}
		},
		
		onProgressChange: function(aWebProgress, aRequest, aCurSelfProgress,
			aMaxSelfProgress, aCurTotalProgress, aMaxTotalProgress, aDownload) {},
		
		onSecurityChange: function(aWebProgress, aRequest, aState, aDownload) {},
		
		onStateChange: function(aWebProgress, aRequest, aStateFlags, aStatus, aDownload) {},
	};
	
	// ツールバーのカスタマイズを監視するイベントリスナ
	function onCustomizationChange(e) {
		button_ = document.getElementById("downloadbox-button");
		
		if( button_ ) {
			progress_ = document.getElementById("downloadbox-progress");
			progressBar_ = document.getElementById("downloadbox-progress-bar");
			label_ = document.getElementById("downloadbox-label");
			
			if( intervalID_ == null ) {
				intervalID_ = window.setInterval(updateUIState, 1000);
			}
		} else {
			if( intervalID_ != null ) {
				window.clearInterval(intervalID_);
				intervalID_ = null;
			}
		}
	}
	
	return {
		onLoad: function() {
			// ダウンロードイベントを監視
			downloadManager_.addListener(downloadProgressListener_);
			
			// ツールバーのカスタマイズを監視
			window.addEventListener("customizationchange", onCustomizationChange, false);
			
			onCustomizationChange();
		},
		
		onUnload: function() {
			// ダウンロードイベントの監視を解除
			downloadManager_.removeListener(downloadProgressListener_);
			
			// ツールバーのカスタマイズの監視を解除
			window.removeEventListener("customizationchange", onCustomizationChange, false);
		},
	};
}();

window.addEventListener("load", DownloadBox.onLoad, false);
window.addEventListener("unload", DownloadBox.onUnload, false);
