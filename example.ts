import * as b from "bobriln";
import * as icons from "./index";

let allicons = icons;

let allnames = Object.keys(allicons);

interface IOneIconData {
    name: string;
    factory: (data?: icons.IIconData) => b.IBobrilNode;
}

interface IOneIconCtx extends b.IBobrilCtx {
    data: IOneIconData;
    over: boolean;
    timer: number;
}

const iconRowStyle = b.styleDef({
    alignItems: "center",
    borderRadius: 4,
    alignContent: "stretch",
    flex: 1,
    flexDirection: "row",
    color: "#212121",
    background: "#E3F2FD",
    padding: 4,
    margin: 4
});

const iconRowStyleOver = b.styleDef({
    color: "#000",
    background: "#4FC3F7"
});

const oneIconWithName = b.createComponent<IOneIconData>({
    init(ctx: IOneIconCtx) {
        ctx.over = false;
        ctx.timer = -1;
    },
    destroy(ctx: IOneIconCtx) {
        if (ctx.timer != -1) clearTimeout(ctx.timer);
    },
    render(ctx: IOneIconCtx, me: b.IBobrilNode) {
        me.tag = "View";
        b.style(me, iconRowStyle, ctx.over && iconRowStyleOver);
        me.children = [ctx.data.factory({ color: ctx.over ? "#000" : "#212121" }), " " + ctx.data.name];
    },
    // This is just to make it little bit fancy
    onPointerDown(ctx: IOneIconCtx) {
        if (ctx.timer != -1) return;
        ctx.over = true; b.invalidate(ctx); ctx.timer = setTimeout(() => {
            ctx.over = false; b.invalidate(ctx); ctx.timer = -1;
        }, 500); return false;
    },
});

const virtualizedScrollRowStyle = b.styleDef({
    position: "absolute",
    alignContent: "stretch",
    left: 0,
    right: 0
});

interface IVirtualizedScrollData {
    rowHeight: number;
    rows: number;
    rowFactory: (row: number) => b.IBobrilChildren;
    style?: b.IBobrilStyles;
}

interface IVirtualizedScrollCtx extends b.IBobrilCtx {
    data: IVirtualizedScrollData;
    pos: number;
}

const VirtualizedScroll = b.createVirtualComponent<IVirtualizedScrollData>({
    init(ctx: IVirtualizedScrollCtx) {
        ctx.pos = 0;
    },
    render(ctx: IVirtualizedScrollCtx, me: b.IBobrilNode) {
        const d = ctx.data;
        me.tag = "ScrollView";
        let ch: b.IBobrilChildArray = [b.View({ style: { height: d.rowHeight * d.rows } })];
        let viewHeight = b.getMedia().height;
        let curRow = Math.floor((ctx.pos - 0.5 * viewHeight) / d.rowHeight);
        if (curRow < 0) curRow = 0;
        let curY = curRow * d.rowHeight;
        let lastY = ctx.pos + viewHeight * 1.5;
        let count = 0;
        while (curY <= lastY) {
            if (curRow >= d.rows) break;
            ch.push(b.withKey(b.View({ style: [virtualizedScrollRowStyle, { height: d.rowHeight, top: curY }] }, d.rowFactory(curRow)), "" + curRow));
            curRow++;
            curY += d.rowHeight;
            count++;
        }
        b.style(me, d.style);
        me.children = ch;
    },
    onScroll(ctx: IVirtualizedScrollCtx, ev: { left: number, top: number }) {
        ctx.pos = ev.top;
        b.invalidate(ctx);
    }
});

b.init(() => {
    return b.View({}, [
        b.View({ style: { marginHorizontal: 4, marginTop: 4, flexDirection: "row" } }, [b.Text({ style: { fontSize: 20 } }, "BobrilN Material Icons"), icons.actionFavorite({ color: "red" })]),
        b.Text({ style: { margin: 4 } }, "All icons have optional parameters size:number=24 and color:string=\"#000\""),
        VirtualizedScroll({
            style: { flex: 1 },
            rows: allnames.length,
            rowHeight: 40,
            rowFactory: (i) => oneIconWithName({ name: allnames[i], factory: allicons[allnames[i]] })
        })
    ]);
});
