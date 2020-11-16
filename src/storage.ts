import { Position } from "vscode";

export class Annotation {
  note : String;
  lineRegex: RegExp;

  constructor(note: String, lineRegex: RegExp) {
    this.note = note;
    this.lineRegex = lineRegex;
  }

  toString() {
    return `[${this.lineRegex}, "${this.note}"]`;
  }
}

class AnnotationStorage {
  annotations: Array<Annotation> = [];

  addAnnotation(annotation: Annotation) {
    this.annotations.push(annotation);
  }
}

export const storage = new AnnotationStorage();
