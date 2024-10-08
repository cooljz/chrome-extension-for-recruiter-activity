function activityHint() {
    let lastActive = document.getElementsByClassName('boss-active-time')[0];

    let activityHint;
    if (lastActive) {
        activityHint = lastActive.textContent;
    } else {
        let isOnline = document.getElementsByClassName('boss-online-tag')[0];
        if(isOnline) {
            activityHint = "在线";
        } else {
            activityHint = "未知";
        }
    }
    if (!activityHint) return;

    let span = document.createElement('span');
    span.textContent = "，" + activityHint;
    let parent = document.getElementsByClassName('job-banner')[0]?.getElementsByClassName('job-status')[0];
    parent?.appendChild(span);
}

activityHint();