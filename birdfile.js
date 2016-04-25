var config = {
    name: 'clouddisk',
    bird_port: 8011,
    staticFileRootDirPath: __dirname + '',
    server: 'http://cp01-bpit-iit-bkmdev-chenhongwei01.epc.baidu.com:8681',
    uuap_server: 'http://itebeta.baidu.com:8100',
    //server: 'https://cp01-bpit-iit-bkmdev-chenhongwei01.epc.baidu.com',
    //uuap_server: 'https://itebeta.baidu.com',
    username: 'liuhui01',
    password_suffix: '',
    mock_cache: false,
    cookie: 'BAIDUID=EE075B9DBEB54D1551948AB1D324C2AE:FG=1; PSTM=1458200333; BIDUPSID=D45B4CE254133D741F81B02CCD3E534E; username=guest; MCITY=-131%3A; BDTUJIAID=a25a5492f8102a7ff574198deeca728b; BDCDISKSUID=8402b83d602237895716231f231d2b2c; pgv_pvi=683174912; BDRCVFR[feWj1Vr5u3D]=I67x6TjHwwYf0; cflag=15%3A3; BDRCVFR[X_XKQks0S63]=mk3SLVN4HKm; BDRCVFR[dG2JNJb_ajR]=mk3SLVN4HKm; BKMASKSID=f3b3087dd0ba8ad02ec1574c5f910e85; BDUSS=hjTFJPVExyQWU1Tzg3YzhHVVlvN25NNEoxY0x5VVllMEY5emNIMGlTeWZEenhYQVFBQUFBJCQAAAAAAAAAAAEAAACnAahJY2hhdGZyaWVuZDYzAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJ-CFFefghRXYW; SACDISKSID=8c85baa7e78923c911467a4f26377dcb; H_PS_PSSID=18881_18285_1469_19035_19672_18240_19689_17946_18205_19558_18133_15512_11533; Hm_lvt_9f587e11877bd68ae3d3797aca89cbf1=1459413838,1459510435,1460015351,1460715122; Hm_lpvt_9f587e11877bd68ae3d3797aca89cbf1=1460965697',
    //cookie:"BAIDUID=C86A02F244C3D9535C141541F695ED7E:FG=1; Hm_lvt_9f587e11877bd68ae3d3797aca89cbf1=1460008237,1460368741,1460530425,1460542841; username=guest; BIDUPSID=C86A02F244C3D9535C141541F695ED7E; PSTM=1458120906; BDCDISKSUID=8402b83d602237895716231f231d2b2c; BDCDISKSID=8c85baa7e78923c9332ccf865c71b2a1; cflag=15%3A3; BDUSS=ZEd34tWU9yTmpnWVprTldJUkUzRlhKdEs3b3JaNmJUUmsxUnZLeTVqNDdyRFZYQVFBQUFBJCQAAAAAAAAAAAEAAACWIilJY2hhdGZyaWVuZDc0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADsfDlc7Hw5XUz; BKMASKSID=f3b3087dd0ba8ad02ec1574c5f910e85; Hm_lpvt_9f587e11877bd68ae3d3797aca89cbf1=1460543307; SACDISKSID=8c85baa7e78923c9ff14928c78ae8907",
    debug: false,
    mock: {
        path: '../mock',  // relative to staticFileRootDirPath
        map: {
/*            '/v1/meeting/list': 'v1_meeting_list',
            '/v1/disk/filelist': 'v1_disk_filelist',
            '/v1/meeting/detail': 'v1_meeting_detail',
            '/v1/meeting/doclist': 'v1_meeting_doclist',
            '/v1/team/filelist': 'v1_team_filelist',
            '/v1/team/dirlists': 'v1_team_dirlists',
            '/v1/common/getuserinfor': 'v1_common_getuserinfor',
            '/v1/disk/createdir': 'v1_disk_createdir',
            '/v1/disk/dirlists': 'v1_disk_dirlists',
            '/v1/team/menulist': 'v1_team_menulist',
            '/static/common/img/default.jpg': 'static_common_img_default.jpg',
            '/v1/team/getfilerule': 'v1_team_getfilerule',
            '/v1/team/addrule': 'v1_team_addrule',*/
        // '/favicon.ico': 'favicon.ico',
	}
    }
};
require('birdv2')(config);