(function($){
  const lang = document.documentElement.lang || 'ko';

  const pathParts = window.location.pathname.split('/');
  const fileName = pathParts.pop(); //pop():배열의 가장 마지막 요소 제거하고 그 값을 변환 
  
  // const urlBase = '/inc/menu_' + lang + '.json'
  const urlBase = `/inc/menu_${lang}.json`

  $.ajax({ //ajax: jQuery의 브라우저에서 서버로 데이터를 주고 받기 위한 요청 함수
    type:'GET', // HTTP 요청 방식(GET, POST 등) => GET(서버에서 정보를 가져올 때) / POST(서버에 정보를 제출, 생성, 전송)
    url:urlBase,
    async:false, // 비동기 여부(기본은 true:권장)
    dataType:'json',
    success: function(data){
      const { link, depth2 } = data;

      const menuKeys = Object.keys(link);
      const nowPagekey = menuKeys.find(key => link[key].endsWith('/' + fileName));

      if (!nowPagekey) return;

      const parentKey = Object.keys(depth2).find(depth1 => depth2[depth1].includes(nowPagekey));
      if (!parentKey) return;

      // page_name은 depth1 출력
      const pageNameE1 = document.querySelector('h2.page_name');
      if (pageNameE1) pageNameE1.innerText = parentKey;

      // title은 그대로 depth2 제목 출력
      const titlePrefix = '|회사소개';
      document.title = `${nowPagekey}${titlePrefix}`;

      // path_list 랜더링
      const html = depth2[parentKey].map(key => {
        const isActive = key === nowPagekey;
        return `<li class="path_item${isActive ? ' active' : ''}">
          <a class="path_text" href="${link[key]}"><span>${key}</span></a>
        </li>`;
      }).join('');

      const pathLineE1 = document.querySelector('.path_wrap .path_list');
      if (pathLineE1) pathLineE1.innerHTML = html;
    }
  });
  const url = location.href.split('#')[0];


  // tab 메뉴 처리 
  function activeTab(index) {
    $('.sub_tabbox .tab_list li').eq(index).addClass('active').siblings().removeClass('active');
    $('.tab_match .matchbox').eq(index).addClass('active').siblings().removeClass('active');

    //목록 스크롤
    const $tab = $('.sub_tabbox .tab_list li').eq(index).find('.tab_btn');
    $('.sub_tabbox .tab_list').animate({
      scrollLeft:$tab.offset().left
    },200);
    
    //화면 스크롤 이동
    $('html, body').animate({
      scrollTop: $('.sub_tabbox').offset().top + 10
    },300, 'swing')  
    }

    // 해시값이 있을 경우 해당 탭 활성화
    if (location.hash) { // 현재 url에 # 해시값이 있는지 확인
      const hashNumber = Number(location.hash.replace('#','')); // Number함수 사용해서 해시를 제거하고 숫자로 변환
      if (!isNaN(hashNumber) && hashNumber > 0) {
        activeTab(hashNumber - 1);
      }
    }

    // 2. 탭 클릭 이벤트
    $('.sub_tabbox').on('click', '.tab_list li .tab_btn', function(){
      const index = $(this).parent().index();
      activeTab(index);
      history.replaceState(null, null, url + '#' + (index+1)); //해시 업데이트
    });

    // 3. 스크롤 고정
    if ($('.sub_tabbox').length > 0) {
      $(window).on('scroll', function(){
        const nowTop = $(document).scrollTop();
        const tabTop = $('.sub_tabbox').offset().top;
        $('.sub_tabbox .tab_list').toggleClass('fixed', nowTop > tabTop);
      });
    }

})(jQuery);

