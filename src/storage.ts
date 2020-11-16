import * as vscode from "vscode";

export class Annotation {
  note : String;
  lineRegex: RegExp;

  constructor(note: String, lineRegex: RegExp) {
    this.note = note;
    this.lineRegex = lineRegex;
  }

  toSerializable() {
    return {
      note: this.note,
      lineRegex: this.lineRegex.source,
    };
  }

  toString() {
    return `[${this.lineRegex}, "${this.note}"]`;
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

  addAnnotation(annotation: Annotation) {
    let currentAnnotations;
    if (currentAnnotations = this.annotations) {
      currentAnnotations.push(annotation);
      this.storageInterface?.persistAnnotations(currentAnnotations);
    }
  }
}

export const storage = new AnnotationStorage();
