import assert from "node:assert/strict";
import test from "node:test";
import { Chess } from "chess.js";
import { LIVING_KINDS } from "../lib/living-matter.ts";
import { canStartLivingScene, isLivingReviewFrame } from "../lib/living-policy.ts";
import { CHESS_BOARD, DECORATIVE_START_POSITION, CHESS_GEOMETRY, chessSquareCenter, knightOpeningPosition, BASKETBALL_HOOP, basketballShotPosition } from "../lib/exhibition-scenes.ts";
import { MAX_PLAYBACK_RATE } from "../lib/living-timeline.ts";

test("ordinary embedded previews play public scenes; only marked laboratory frames delegate playback", () => {
 for(const attribute of [undefined,null,"","false"]) {
  assert.equal(isLivingReviewFrame(attribute),false);
  for(const kind of LIVING_KINDS) assert.equal(canStartLivingScene({kind,reducedMotion:false,documentHidden:false,reviewFrameAttribute:attribute}),true);
 }
 assert.equal(isLivingReviewFrame("true"),true);
 for(const kind of LIVING_KINDS) {
  assert.equal(canStartLivingScene({kind,reducedMotion:false,documentHidden:false,reviewFrameAttribute:"true"}),false);
  assert.equal(canStartLivingScene({kind,reducedMotion:true,documentHidden:false}),false);
  assert.equal(canStartLivingScene({kind,reducedMotion:false,documentHidden:true}),false);
 }
 assert.equal(canStartLivingScene({kind:"unknown",reducedMotion:false,documentHidden:false}),false);
 assert.ok(MAX_PLAYBACK_RATE>=3 && MAX_PLAYBACK_RATE<=4);
});

test("the decorative chess study uses a correctly oriented complete starting position", () => {
 const chess = new Chess();
 assert.equal(CHESS_BOARD.length,64); assert.equal(new Set(CHESS_BOARD.map(tile=>tile.square)).size,64);
 assert.equal(CHESS_BOARD.find(tile=>tile.square==="a1")?.dark,true);
 assert.equal(CHESS_BOARD.find(tile=>tile.square==="h1")?.dark,false);
 assert.equal(DECORATIVE_START_POSITION.length,32);assert.equal(new Set(DECORATIVE_START_POSITION.map(piece=>piece.square)).size,32);
 const types:Record<string,string>={rook:"r",knight:"n",bishop:"b",queen:"q",king:"k",pawn:"p"};
 for(const piece of DECORATIVE_START_POSITION) {
  const actual=chess.get(piece.square as Parameters<typeof chess.get>[0]);
  assert.equal(actual?.type,types[piece.kind]);assert.equal(actual?.color,piece.color==="white"?"w":"b");
 }
 assert.equal(CHESS_GEOMETRY.size,CHESS_GEOMETRY.square*8);
});

test("the decorative legal opening never reads or resets an independent visitor game", () => {
 const visitor=new Chess(); visitor.move("e4");visitor.move("c5");const fen=visitor.fen();
 assert.deepEqual(knightOpeningPosition(0),{...chessSquareCenter(6,1),lift:0});
 const end=knightOpeningPosition(1);const target=chessSquareCenter(5,3);
 assert.ok(Math.abs(end.x-target.x)<1e-8 && Math.abs(end.y-target.y)<1e-8);
 const preview=new Chess();assert.ok(preview.move({from:"g1",to:"f3"}));
 for(let i=0;i<=100;i++) { const pose=knightOpeningPosition(i/100);assert.ok(Number.isFinite(pose.x)&&Number.isFinite(pose.y)); }
 assert.equal(visitor.fen(),fen);
});

test("the shot reaches the hoop while descending and only then moves the net", () => {
 const crossing=basketballShotPosition(BASKETBALL_HOOP.crossing);
 assert.equal(crossing.x,BASKETBALL_HOOP.x);assert.equal(crossing.y,BASKETBALL_HOOP.y);assert.equal(crossing.net,0);
 const before=basketballShotPosition(BASKETBALL_HOOP.crossing-.01); const after=basketballShotPosition(BASKETBALL_HOOP.crossing+.01);
 assert.ok(before.y<crossing.y && after.y>crossing.y);assert.equal(before.net,0);assert.ok(after.net>0);
 for(let i=0;i<=100;i++) {const pose=basketballShotPosition(i/100);assert.ok(pose.x>=0&&pose.x<=1000&&pose.y>=0&&pose.y<=650&&pose.net>=0);}
});
