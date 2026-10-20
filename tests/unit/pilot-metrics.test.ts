import test from "node:test";
import assert from "node:assert/strict";
import { pilotRate } from "../../src/modules/operations/pilot-metrics";
test("0.3: empty pilot cannot claim an activation rate",()=>assert.equal(pilotRate(0,0),null));
