
var downloadStatusButton = function() {
	const Cc = Components.classes;
	const Ci = Components.interfaces;
	
	var downloadManager_ = Cc["@mozilla.org/download-manager;1"]
		.createInstance(Ci.nsIDownloadManager);
	
	var downloadStatusLabel_;
	
	var downloadProgressListener_ = {
		onDownloadStateChange: function(aState, aDownload) {
			downloadStatusLabel_.value = (downloadManager_.activeDownloadCount == 0) ?
				"none" : downloadManager_.activeDownloadCount.toString();
		},
		
		onProgressChange: function(aWebProgress, aRequest, aCurSelfProgress,
			aMaxSelfProgress, aCurTotalProgress, aMaxTotalProgress, aDownload) {
			
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
