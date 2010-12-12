
var downloadStatusButton = function() {
	const Cc = Components.classes;
	const Ci = Components.interfaces;
	
	var downloadManager_ = Cc["@mozilla.org/download-manager;1"]
		.createInstance(Ci.nsIDownloadManager);
	
	/*
	var app_ = Components.classes["@mozilla.org/fuel/application;1"]
		.getService(Components.interfaces.fuelIApplication);
	*/
	
	var downloadStatusProgress_;
	var downloadStatusProgressBar_;
	var downloadStatusLabel_;
	
	var downloadProgressListener_ = {
		onDownloadStateChange: function(aState, aDownload) {
			if( downloadManager_.activeDownloadCount == 0 ) {
				downloadStatusProgressBar_.style.height = "0px";
				downloadStatusLabel_.value = "";
			} else {
				downloadStatusLabel_.value = downloadManager_.activeDownloadCount.toString();
			}
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
	
	function startObservation() {
		downloadManager_.addListener(downloadProgressListener_);
	}
	
	function stopObservation() {
		downloadManager_.removeListener(downloadProgressListener_);
	}
	
	return {
		onLoad: function() {
			downloadStatusProgress_ = document.getElementById("download-status-progress");
			downloadStatusProgressBar_ = document.getElementById("download-status-progress-bar");
			downloadStatusLabel_ = document.getElementById("download-status-label");
			
			startObservation();
		},
		
		onUnload: function() {
			stopObservation();
		},
	};
}();

window.addEventListener("load", downloadStatusButton.onLoad, false);
window.addEventListener("unload", downloadStatusButton.onUnload, false);
