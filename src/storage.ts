import * as vscode from "vscode";

export class Annotation {
  note : String;
  lineRegex : RegExp;
  id : String;

  constructor(note: String, lineRegex: RegExp, id: String) {
    this.note = note;
    this.lineRegex = lineRegex;
    this.id = id;
  }

  toSerializable() {
    return {
      note: this.note,
      lineRegex: this.lineRegex.source,
      id: this.id,
    };
  }

  toString() {
    return `[${this.id}, ${this.lineRegex}, "${this.note}"]`;
  }
}

export interface IStorageInterface {
  getCurrentAnnotations(): Array<Annotation>;
  persistAnnotations(annotations: Array<Annotation>): void;
  resetStoredAnnotations(): void;
}

class AnnotationStorage {
  storageInterface: IStorageInterface | undefined = undefined;

  get annotations() : Array<Annotation> | undefined {
    return this.storageInterface?.getCurrentAnnotations();
  }

  set annotations(annotations: Array<Annotation> | undefined) {
    if (annotations) {
      this.storageInterface?.persistAnnotations(annotations);
    }
  }

  getAnnotationForString(search: string): Array<Annotation> | undefined {
    return this.annotations?.filter(annotation => annotation.lineRegex.test(search) ? true : false);
  }

  addAnnotation(annotation: Annotation) {
    let currentAnnotations;
    if (currentAnnotations = this.annotations) {
      currentAnnotations.push(annotation);
      this.storageInterface?.persistAnnotations(currentAnnotations);
    }
  }
}

export const storage = new AnnotationStorage();
