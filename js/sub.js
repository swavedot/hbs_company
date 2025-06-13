(function($){
  const lang = document.documentElement.lang || 'ko';

  const pathParts = window.location.pathname.split('/');
  const fileName = pathParts.pop(); //pop():배열의 가장 마지막 요소 제거하고 그 값을 반환

  // const urlBase = '/inc/menu_' + lang + '.json'
  const urlBase = `/inc/menu_${lang}.json`

  $.ajax({ //ajax: jQuery의 브라우저에서 서버로 데이터를 주고 받기 위한 요청 함수
    type:'GET', // HTTP 요청 방식(GET, POST 등) => GET(서버에서 정보를 가져올 때) / POST(서버에 정보를 제출, 생성, 전송)
    url:urlBase,
    async:false, // 비동기 여부(기본은 true:권장)
    dataType: 'json',
    success: function(data){
      const { link, depth2 } = data;

      const menuKeys = Object.keys(link);
      const nowPageKey = menuKeys.find(key => link[key].endsWith('/'+fileName));

      if (!nowPageKey) return;

      const parentKey = Object.keys(depth2).find(depth1 => depth2[depth1].includes(nowPageKey));
      if (!parentKey) return;

      // page_name은 depth1 출력
      const pageNameEl = document.querySelector('h2.page_name');
      if (pageNameEl) pageNameEl.innerText = parentKey;

      // title은 그대로 depth2 제목 출력
      const titlePrefix = '|회사소개';
      document.title = `${nowPageKey}${titlePrefix}`;

      // path_list 랜드링
      const html = depth2[parentKey].map(key => {
        const isActive = key === nowPageKey;
        return `<li class="path_item${isActive ? ' active' : ''}">
           <a class="path_text" href="${link[key]}"><span>${key}</span></a>
           </li>`;
      }).join('');

      const pathLineEl = document.querySelector('.path_wrap .path_list');
      if (pathLineEl) pathLineEl.innerHTML = html;      
    }
  });
  const url = location.href.split('#')[0];

  // tab 메뉴 처리
  function activeTab(index) {
    $('.sub_tabbox .tab_list li').eq(index).addClass('active').siblings().removeClass('active');
    $('.tab_match .matchbox').eq(index).addClass('active').siblings().removeClass('active');

    // 탭 목록 스크롤 이동
    const $tab = $('.sub_tabbox .tab_list li').eq(index).find('.tab_btn');
    $('.sub_tabbox .tab_list').animate({
      scrollLeft:$tab.offset().left
    },200);

    // 화면 스크롤 이동
    $('html, body').animate({
      scrollTop: $('.sub_tabbox').offset().top + 10
    },300, 'swing');
  }

  // 1. 해시값이 있을 경우 해당 탭 활성화
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

  // 반응형 테이블
  $('.table.responsive').each(function(){
    const $table = $(this);
    const $header = $table.find('thead th');

    $table.find('tbody tr').each(function(){
      const $cells = $(this).find('td');

      $cells.each(function (index){
        const headerText = $header.eq(index).text().trim();
        $(this).attr('data-content', `${headerText} : `);
      });
    });
  });

  // open_table
  $('.open_table').on('click', function(){
    const $btn = $(this);
    const $target = $btn.next('.conbox');
    const isOpen = $btn.attr('title') === '열기';

    if (window.innerWidth < 1001) {
      $btn
        .attr('title', isOpen ? '닫기' : '열기')
        .toggleClass('on', isOpen);

        $target.stop(true).slideToggle(300);
    }
  });
})(jQuery);

// 브랜드 상품 팝업 처리
const urlParams = new URL(location.href).searchParams;
const brandId = urlParams.get('brandId');

// 팝업 열기 함수
function openBrandPopup(brand) {
  const $popup = $('.brand_layer_popup');
  $popup.addClass('on')
      .find('ly_' + brand).addClass('active')
      .siblings().removeClass('active');

  $popup.find('.layer_close').focus();
  $('body').addClass('lock');
}

// 팝업 닫기 함수
function closeBrandPopup() {
  const activeBrand = $('layer_con.active').data('brand');
  $('.brand_layer_popup').removeClass('on');
  // $('.brand_box button[data-brand = "' + activeBrand + '"]').focus();
  $(`.brand_box button[data-brand = "${activeBrand}"]`).focus();
  $('body').removeClass('lock');
}

// url에 브랜드 id가 있으면 팝업 자동 오픈
if (brandId) {
  openBrandPopup(brandId);
}

// 브랜드 버튼 클릭 시 팝업 오픈
$('.brand_box button').on('click', function(){
  const brand = $(this).data('brand');
  openBrandPopup(brand);
});

// 닫기 버튼 클릭 시 팝업 닫기
$('.layer_close').on('click', closeBrandPopup);

// 바깥 영역 클릭 시 팝업 오픈
$('.brand_layer_popup').on('click', function(e){
  if (!$(e.target).closest('.layer_con').length) {
    $(this).removeClass('on');
    $('body').removeClass('lock')
  }
});

// 문의하기 입력 정보 처리 및 개인정보 보호 팝업 관련 
document.addEventListener('DOMContentLoaded', () => { //HTML이 완전히 화면 로딩 후 실행


  const qs = (sel, ctx = document) => ctx.querySelector(sel);
  // 선택자 하나에 해당하는 요소를 가져오는 단축 함수
  //qs('#company') = document.querySeletor('#company')와 동일

  const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)]; //선택자에 해당하는 모든 요소를 배열로 변환하는 함수
  const body = document.body;

  // 1. input filter 관련
  qs('#phone')?.addEventListener('input', ({ target })=>{
    target.value = target.value.replace(/\D/g, '');
  });
  // ?.은 optional chaining으로, 해당 요소가 존재할 경우에만 이벤트 리스너 진행
  // /\D/g(정규식)는 숫자가 아닌 모든 문자를 모두 제거함 
  // qs /qsa : 유틸 함수(다른 요소들에도 활용 가능하며, html 접근 코드를 간결하게 유지해주는 역할)

  /* max-length 300 초과하지않고 입력필드 글자 수 제한 + 실시간 카운트 */
  const inquireInput = qs('#inquire');

  if (inquireInput) {
    const counterE1 = qs('.word.count .current');  // 현재 글자수를 실시간 표시 
    inquireInput.addEventListener('input', ({ target }) => {
      if (target.value.length > 300) target.value = target.value.slice(0, 300); // 입력값이 300자를 초과하지 않도록 자름
      counterE1 && (counterE1.textContent = `${target.value.length}`);
    });
  }

  /* privacy popup 관련*/
  const popup = qs('.privacy_popup');
  const openBtn = qs('.fake_chk .label button');
  const closeBtns = qsa ('.privacy_popup .pop_close, .privacy_popup .close');
  const confirmBtn = qs('.privacy_popup .pop_confirm');
  const privacyChk = qs('#privacy');
  
  // 팝업이 열렸을 때 뒷배경 스크롤 방지 위한 lock 클래스 추가/제거 
  // .lock이 css에서 반드시 overflow:hidden 으로 되어있어야 한다.
  const lockBody = () => body.classList.add('lock');
  const unlockBody = () => body.classList.remove('lock');
  const openPopup = () => { popup?.classList.add('active'); lockBody(); };
  const closePopup = () => { popup?.classList.remove('active'); unlockBody(); };
  
  /* openPopup*/
  openBtn?.addEventListener('click', openPopup);
  closeBtns.forEach(btn => btn.addEventListener('click', ()=> {
    closePopup(); openBtn?.focus();
  }));
  confirmBtn?.addEventListener('click', () => {
    closePopup(); privacyChk && (privacyChk.checked = true);
  });

  const MAX_SIZE = 30 * 1024 * 1024;
  //업로드 가능한 최대 용량 30MB = 30 x 1024 x 1024byte
  qsa('.con_input .upload_hidden')?.forEach(input => {
    input.addEventListener('change', ({target}) => {
      const file = target.files?.[0];
      if (!file) return;
      if (file.size > MAX_SIZE) {
        alert('30MB 이하의 파일만 업로드 가능합니다.');
        target.value = ''; // 파일 초기화 
        return;
      }
      const label = target.closest('.con_input')?.querySelector('.upload_name');
      label && (label.value = file.name);
    });
  });

  // util
  const emailCheck = email => /^[\w.-]+@[\w.-]+$/.test(email);
});