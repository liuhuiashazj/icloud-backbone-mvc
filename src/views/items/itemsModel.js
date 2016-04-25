/**
 * Created by liuhui on 15/9/10.
 */
define([],function(){
    var Model = Backbone.Model.extend({
        idAttribute:"mid",

        parse:function(res){
            res.page=this.collection.currentPage;;
            res.id=res.mid-0;
            return res;
        }

    });

    return Model;
});