(function() {
  const originalOpen = XMLHttpRequest.prototype.open;
  const url = 'https://www.zhipin.com/wapi/zpgeek/search/joblist.json';
  XMLHttpRequest.prototype.open = function() {
    this.addEventListener('load', function() {
      if (this.responseURL.startsWith(url)) {
        if (typeof this.response !== 'string') return;
        const obj = JSON.parse(this.response);
        
        let elements = obj.zpData.jobList.map(job => {
          let activity = sessionStorage.getItem(job.encryptBossId);
          if (job.bossOnline) return null;
          if (!activity) {
            activeCacheJob(job);
            return null;
          }
          return createActivityElement(activity);
        });

        batchUpdateActivity(elements, stripLid(obj.zpData.jobList[0].lid));
      }
    });
    return originalOpen.apply(this, arguments);
  };

  function createActivityElement(activity) {
    if (!activity) return null;
    let span = document.createElement('span');
    span.textContent = activity;
    span.className = classNameForActivity(activity);
    return span;
  }

  function classNameForActivity(activity) {
    let defaultClassName = 'boss-online-tag';
    if (activity.includes('年') || activity === '未知') {
      return defaultClassName + ' dead-recruiter';
    } else if (activity.includes('月')) {
      return defaultClassName + ' stale-recruiter';
    } else if (activity.includes('周')) {
      return defaultClassName + ' stale-recruiter';
    } else {
      return defaultClassName;
    }
  }
  
  function batchUpdateActivity(elements, baseId) {
    console.assert(typeof baseId === 'number');
    requestAnimationFrame(() => {
      elements.forEach((e, i) => {
        updateActivity(e, i + baseId);
      });
    })
  }

  function updateActivity(e, i) {
    if (!e) return;
    let parent = document.querySelector(`li[ka="search_list_${i}"] .job-info`);
    parent?.appendChild(e);
  }

  function activeCacheJob({ encryptBossId, securityId, lid }) {
    console.log("caching: " + securityId, lid);
    const url = composeJobDetailURL(securityId, lid);
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onload = () => {
      if (xhr.status < 200 || xhr.status >= 300) { return; }
      // TODO: cache responses for better performance
      // sessionStorage.setItem(securityId, xhr.response);

      let jobDetail = JSON.parse(xhr.response);
      let encryptUserId = jobDetail.zpData.jobInfo.encryptUserId;
      let activeTimeDesc = jobDetail.zpData.bossInfo.activeTimeDesc;
      console.assert(encryptUserId === encryptBossId);
      sessionStorage.setItem(encryptUserId, activeTimeDesc);

      activeTimeDesc = activeTimeDesc || '未知';
      let span = createActivityElement(activeTimeDesc);
      let index = stripLid(lid);
      updateActivity(span, index);
    }
    xhr.send();
  }

  function composeJobDetailURL(securityId, lid) {
    return `https://www.zhipin.com/wapi/zpgeek/job/detail.json?securityId=${securityId}&lid=${lid}`;
  }

  function stripLid(lid) {
    return Number.parseInt(lid.substring(lid.lastIndexOf('.') + 1));
  }
})();