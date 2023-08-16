enum DurationType {
  Seconds = 'seconds',
}

export class Duration {
  private seconds: number

  constructor(value: number, type: DurationType = DurationType.Seconds) {
    switch (type) {
      case DurationType.Seconds:
        this.seconds = value
        break
    }
  }

  toSeconds() {
    return this.seconds
  }
}
