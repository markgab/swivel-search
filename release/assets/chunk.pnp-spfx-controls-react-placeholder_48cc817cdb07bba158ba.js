(window.webpackJsonpbbeeab12a47a4a09585add8642c6ac67=window.webpackJsonpbbeeab12a47a4a09585add8642c6ac67||[]).push([[3],{"0dZV":function(e,t,n){"use strict";n.r(t);var a=n("P+o8");for(var i in a)["default"].indexOf(i)<0&&function(e){n.d(t,e,function(){return a[e]})}(i)},Eo41:function(e,t){},"P+o8":function(e,t,n){"use strict";n.r(t);var a=n("Eo41");for(var i in a)["default"].indexOf(i)<0&&function(e){n.d(t,e,function(){return a[e]})}(i);var r=n("VNoh");n.d(t,"Placeholder",function(){return r.e})},VNoh:function(e,t,n){"use strict";n.d(t,"e",function(){return f});var a=n("cDcd"),i=n("uqg9");n("Xpmx");var r,o=n("/A2d"),s=n.n(o),c=n("UWqr"),d=function(){return(d=Object.assign||function(e){for(var t,n=1,a=arguments.length;n<a;n++)for(var i in t=arguments[n])Object.prototype.hasOwnProperty.call(t,i)&&(e[i]=t[i]);return e}).apply(this,arguments)},l=n("DeEv"),u=(r=function(e,t){return(r=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])})(e,t)},function(e,t){function n(){this.constructor=e}r(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)}),f=function(e){function t(t){var n,a=e.call(this,t)||this;return a._crntElm=null,a._handleBtnClick=function(e){a.props.onConfigure()},a._setZoneWidth=function(){a.setState({width:a._crntElm.clientWidth})},a._linkElm=function(e){a._crntElm=e},a.state={width:null},"ReactPlaceholder",void 0===(n={description:!!t.description,iconName:!!t.iconName,iconText:!!t.iconText,buttonLabel:!!t.buttonLabel,onConfigure:!!t.onConfigure,contentClassName:!!t.contentClassName})&&(n={}),s.a.getInstance().trackEvent("ReactPlaceholder",d({version:"3.5.0",controlType:"react",debug:"false",environment:c.EnvironmentType[c.Environment.type]},n)),a}return u(t,e),t.prototype.componentDidMount=function(){this._setZoneWidth()},t.prototype.componentDidUpdate=function(e,t){this._setZoneWidth()},t.prototype.shouldComponentUpdate=function(e,t){for(var n in e)if("_onConfigure"!=n&&e[n]!=this.props[n])return!0;return this.state.width!==t.width||this.props.hideButton!==e.hideButton},t.prototype.render=function(){var e=this.props,t=e.iconName,n=e.iconText,r=e.description,o=e.children,s=e.buttonLabel,c=e.hideButton,d="placeholderText_27d3ec8c "+(this.state.width&&this.state.width<=380?"hide_27d3ec8c":""),u="string"==typeof n?a.createElement("span",{className:d},this.props.iconText):n(d),f="string"==typeof r?a.createElement("span",{className:"placeholderDescriptionText_27d3ec8c"},this.props.description):r("placeholderDescriptionText_27d3ec8c");return a.createElement("div",{className:"placeholder_27d3ec8c "+(this.props.contentClassName?this.props.contentClassName:""),ref:this._linkElm},a.createElement("div",{className:"placeholderContainer_27d3ec8c"},a.createElement("div",{className:"placeholderHead_27d3ec8c"},a.createElement("div",{className:"placeholderHeadContainer_27d3ec8c"},t&&a.createElement(l.e,{iconName:t,className:"placeholderIcon_27d3ec8c"}),u)),a.createElement("div",{className:"placeholderDescription_27d3ec8c"},f),o,a.createElement("div",{className:"placeholderDescription_27d3ec8c"},s&&!c&&a.createElement(i.e,{text:s,ariaLabel:s,ariaDescription:"string"==typeof r?r:"",onClick:this._handleBtnClick}))))},t}(a.Component)},Xpmx:function(e,t,n){var a=n("gtmu"),i=n("ruv1");"string"==typeof a&&(a=[[e.i,a]]);for(var r=0;r<a.length;r++)i.loadStyles(a[r][1],!0);a.locals&&(e.exports=a.locals)},gtmu:function(e,t,n){(e.exports=n("JPst")(!1)).push([e.i,'.placeholder_27d3ec8c{display:-ms-flexbox;display:flex}.placeholder_27d3ec8c .placeholderContainer_27d3ec8c{-ms-flex-align:center;align-items:center;color:"[theme:neutralSecondary, default: #666666]";background-color:"[theme:neutralLighter, default: #f4f4f4]";width:100%;padding:80px 0}.placeholder_27d3ec8c .placeholderContainer_27d3ec8c .placeholderHead_27d3ec8c{color:"[theme:neutralPrimary, default: #333333]"}.placeholder_27d3ec8c .placeholderContainer_27d3ec8c .placeholderHead_27d3ec8c .placeholderHeadContainer_27d3ec8c{height:100%;white-space:nowrap;text-align:center}.placeholder_27d3ec8c .placeholderContainer_27d3ec8c .placeholderHead_27d3ec8c .placeholderIcon_27d3ec8c{display:inline-block;vertical-align:middle;white-space:normal;font-size:42px}.placeholder_27d3ec8c .placeholderContainer_27d3ec8c .placeholderHead_27d3ec8c .placeholderText_27d3ec8c{display:inline;vertical-align:middle;white-space:normal;font-weight:100;font-size:28px}.placeholder_27d3ec8c .placeholderContainer_27d3ec8c .placeholderHead_27d3ec8c .placeholderText_27d3ec8c.hide_27d3ec8c{display:none}.placeholder_27d3ec8c .placeholderContainer_27d3ec8c .placeholderDescription_27d3ec8c{width:65%;vertical-align:middle;margin:0 auto;text-align:center}.placeholder_27d3ec8c .placeholderContainer_27d3ec8c .placeholderDescription_27d3ec8c .placeholderDescriptionText_27d3ec8c{color:"[theme:neutralSecondary, default: #666666]";font-size:17px;display:inline-block;margin:24px 0;font-weight:100}.placeholder_27d3ec8c .placeholderContainer_27d3ec8c .placeholderDescription_27d3ec8c button{font-size:14px;font-weight:400;box-sizing:border-box;display:inline-block;text-align:center;cursor:pointer;vertical-align:top;min-width:80px;height:32px;background-color:"[theme:themePrimary, default: #0078d7]";color:#fff;-webkit-user-select:none;-ms-user-select:none;user-select:none;outline:transparent;border:1px solid transparent;-o-border-image:initial;border-image:initial;text-decoration:none}[dir=ltr] .placeholder_27d3ec8c .placeholderContainer_27d3ec8c .placeholderHead_27d3ec8c .placeholderText_27d3ec8c,[dir=rtl] .placeholder_27d3ec8c .placeholderContainer_27d3ec8c .placeholderHead_27d3ec8c .placeholderText_27d3ec8c{padding-left:20px}',""])}}]);