new Vue(
    {
        el: "#app",
        data() {
            return {
                softlist: [],
                all_plat_info: {

                },
                current_report_index: -1,
                ws: null,
            }
        },
        mounted() {
            window.bdtech_vue_ui = this;
            this.softlist = linux_soft_list;
            bdtech_get_version().then((version) => {
                console.log("app version:", version)
            })

            setTimeout(() => {
                // this.report_all_account()
                var data = []
                for (var u of this.userlist) {
                    data.push({ platid: u.platid, account_name: u.userid })
                }
                BDStartTimerCapture(data)
            }, 1000);
        },
        methods: {

            report_media(data) {
                window.BDStartCapture(data.platid, data.userid)
                // console.log(data)
            },
            get_account_by_ids(platid, userid) {
                for (var u of this.userlist) {
                    // console.log(u)
                    if (u.userid == userid && u.platid == platid) {
                        return u
                    }
                }
                return null
            },
            on_plat_data_update(platid, userid, info_type, info) {
                // console.log("data updated in vue!!", info_type, info)

                var key = "plat_" + platid + "_" + userid;
                console.log("key:", key)
                // console.log("data updated in key!!", this.all_plat_info.key)
                //将数据存入 all_plat_info
                if (typeof (this.all_plat_info[key]) == "undefined") {

                    this.all_plat_info[key] = {}
                }

                if (info_type === "video") {
                    this.all_plat_info[key][info_type] = info
                } else if (typeof (this.all_plat_info[key][info_type]) == "undefined") {
                    this.all_plat_info[key][info_type] = info
                }


                var muser = this.get_account_by_ids(platid, userid)
                if (info_type == "user") {
                    muser.loged = "登录正常"
                    //TODO 假设为空时绑定
                    if (muser.platuserid == "") {
                        muser.platuserid = info.account_id
                        //alert("绑定成功！！！")

                        this.$notify({
                            title: '成功',
                            message: '这是一条成功的提示消息',
                            type: 'success'
                        });
                    }
                    if (muser.platuserid != info.account_id) {
                        console.log("与绑定账号不一致！！！", muser.platuserid, info.account_id)
                    } else {
                        //TODO 每次收到用户信息都会请求视频数据
                        BDGetVideoInfo()

                        muser.fans = info.fans_num;
                        muser.platnick = info.nick_name;
                        muser.verify = info.is_certified;
                    }
                } else if (info_type == "video") {


                    var all_video_like = 0;
                    var all_video_play = 0;
                    //console.log("视频数据", this.all_plat_info[key][info_type])
                    // console.log("video vue size:!!!!!!!!!!!", Object.keys(this.all_plat_info[key][info_type]).length)
                    //统计所有视频播放量
                    for (var id in this.all_plat_info[key][info_type]) {
                        var v = this.all_plat_info[key][info_type][id]
                        //console.log("hello v ", v)
                        all_video_like += v.like_count;
                        all_video_play += v.play_count;
                    }
                    muser.videos = Object.keys(this.all_plat_info[key][info_type]).length;
                    muser.like = all_video_like;
                    muser.read = all_video_play;
                    BDGetLiveInfo()
                } else if (info_type == "live") {
                    muser.lives = Object.keys(this.all_plat_info[key][info_type]).length;
                } else if (info_type === "error") {
                    if (info.msg === "timeout") {
                        muser.loged = "登录失效"
                    }
                }

                //console.log(this.userlist)
                //this.set(userlist, this.userlist);

            },

        }

    }
);