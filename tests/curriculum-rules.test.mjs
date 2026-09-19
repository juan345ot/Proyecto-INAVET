import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateCurriculum } from '../server/services/curriculumRules.js';

function fixture() {
  return {
    modules: ['a','b'].map((_id, order) => ({_id, order, title: _id, status:'ACTIVE'})),
    lessons: ['a1','a2','b1','b2'].map((_id,i) => ({_id,moduleId:_id[0],order:i+1,title:_id,status:'ACTIVE'})),
    materials: ['a1','a2','b1','b2'].map(lessonId => ({_id:'m'+lessonId,lessonId})),
    exams: ['a1','a2','b1','b2'].map(lessonId => ({_id:'e'+lessonId,lessonId,status:'ACTIVE'})).concat({_id:'final-a',moduleId:'a',status:'ACTIVE'}),
    progress: [], attempts: [],
  };
}
const state = data => evaluateCurriculum(data);
const complete = (data, lessonId) => { data.progress.push({lessonId,materialsViewed:['m'+lessonId]}); data.attempts.push({examId:'e'+lessonId,passed:true}); };

test('each module starts independently even with global legacy order values', () => {
  const rows=state(fixture());
  assert.deepEqual(rows.map(m=>m.lessons.map(l=>l.status)),[['AVAILABLE','LOCKED'],['AVAILABLE','LOCKED']]);
});
test('exam alone and unrelated/stale material IDs cannot complete a class', () => {
  const f=fixture(); f.attempts.push({examId:'ea1',passed:true}); f.progress.push({lessonId:'a1',materialsViewed:['mb1','deleted'],isCompleted:true});
  const a=state(f)[0]; assert.equal(a.lessons[0].status,'IN_PROGRESS'); assert.equal(a.lessons[1].status,'LOCKED');
});
test('materials alone cannot unlock next class; no active exam cannot complete', () => {
  const f=fixture(); f.progress.push({lessonId:'a1',materialsViewed:['ma1'],examPassed:true,isCompleted:true});
  assert.equal(state(f)[0].lessons[1].status,'LOCKED');
  complete(f,'a1'); f.exams[0].status='INACTIVE'; assert.equal(state(f)[0].lessons[1].status,'LOCKED');
});
test('progress in another module never unlocks a class', () => {
  const f=fixture();complete(f,'a1');
  assert.equal(state(f)[0].lessons[1].status,'AVAILABLE');assert.equal(state(f)[1].lessons[1].status,'LOCKED');
});
test('final evaluation requires all classes; passing it completes only its module', () => {
  const f=fixture(); complete(f,'a1'); assert.equal(state(f)[0].finalExam.status,'LOCKED');
  complete(f,'a2'); assert.equal(state(f)[0].finalExam.status,'AVAILABLE'); assert.notEqual(state(f)[0].status,'COMPLETED');
  f.attempts.push({examId:'final-a',passed:true});assert.equal(state(f)[0].status,'COMPLETED');assert.equal(state(f)[1].lessons[1].status,'LOCKED');
});
test('a stale completion does not bypass earlier lessons after reordering', () => {
  const f=fixture(); complete(f,'a2'); assert.equal(state(f)[0].lessons[1].status,'LOCKED');
});
test('inactive modules and lessons are excluded; titles and order are not changed', () => {
  const f=fixture(); f.modules[1].status='INACTIVE';f.lessons[0].status='INACTIVE';f.lessons[1].title='Clase 1';
  const rows=state(f);assert.equal(rows.length,1);assert.equal(rows[0].lessons[0].status,'AVAILABLE');assert.equal(rows[0].lessons[0].title,'Clase 1');assert.equal(rows[0].lessons[0].order,2);
});
test('final approval is invalid for completion if a new required material is added', () => {
  const f=fixture();complete(f,'a1');complete(f,'a2');f.attempts.push({examId:'final-a',passed:true});
  f.materials.push({_id:'new',lessonId:'a1'});assert.notEqual(state(f)[0].status,'COMPLETED');assert.equal(state(f)[0].finalExam.status,'LOCKED');
});
