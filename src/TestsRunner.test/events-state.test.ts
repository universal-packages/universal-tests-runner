import { EmittedEvent } from '@universal-packages/event-emitter'
import { Measurement } from '@universal-packages/time-measurer'

import { TestError } from '../TestError'
import { TestRunner } from '../TestRunner'
import { TestsRunner } from '../TestsRunner'
import { TestsRunnerState } from '../TestsRunner.types'
import { evaluateTestResults } from '../utils.test'

export async function eventsStateTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('Events state test', () => {
    selfTestsRunner.test('Should emit the correct events in the correct order', async () => {
      const testsRunner = new TestsRunner()
      const eventsOrder: { event: EmittedEvent; state: TestsRunnerState }[] = []

      testsRunner.on('**' as any, (event) => {
        eventsOrder.push({ event, state: testsRunner.state })
      })

      testsRunner.before(() => {})
      testsRunner.beforeEach(() => {})
      testsRunner.after(() => {})
      testsRunner.afterEach(() => {})

      testsRunner.describe('Arithmetic', () => {
        testsRunner.test('Addition', () => {
          testsRunner.expect(1 + 1).toEqual(2)
        })

        testsRunner.describe('Subtraction', () => {
          testsRunner.test('Subtraction', () => {
            testsRunner.expect(1 - 1).toEqual(0)
          })
        })

        testsRunner.test('Math failure', () => {
          testsRunner.expect(1 + 1).toEqual(3)
        })
      })

      await testsRunner.run()

      selfTestsRunner.expect(eventsOrder.length).toEqual(29)
      selfTestsRunner.expect(eventsOrder[0]).toMatchObject({
        event: {
          event: 'describe',
          payload: {
            name: 'Arithmetic',
            options: {}
          }
        },
        state: {
          status: 'idle',
          identifier: 'tests-runner',
          nodes: {
            status: 'idle',
            tests: [],
            children: [
              {
                status: 'idle',
                name: 'Arithmetic',
                tests: [],
                children: []
              }
            ]
          },
          tests: []
        }
      })
      selfTestsRunner.expect(eventsOrder[1]).toMatchObject({
        event: {
          event: 'test',
          payload: {
            name: 'Addition',
            test: selfTestsRunner.expectInstanceOf(TestRunner)
          }
        },
        state: {
          status: 'idle',
          identifier: 'tests-runner',
          nodes: {
            status: 'idle',
            tests: [],
            children: [
              {
                status: 'idle',
                name: 'Arithmetic',
                tests: [
                  {
                    status: 'idle',
                    id: 'tests-runner-1',
                    name: 'Addition'
                  }
                ],
                children: []
              }
            ]
          },
          tests: [{ id: 'tests-runner-1', name: 'Addition' }]
        }
      })
      selfTestsRunner.expect(eventsOrder[2]).toMatchObject({
        event: {
          event: 'describe',
          payload: {
            name: 'Subtraction',
            options: {}
          }
        },
        state: {
          status: 'idle',
          identifier: 'tests-runner',
          nodes: {
            status: 'idle',
            tests: [],
            children: [
              {
                status: 'idle',
                name: 'Arithmetic',
                options: {},
                tests: [
                  {
                    id: 'tests-runner-1',
                    name: 'Addition'
                  }
                ],
                children: [
                  {
                    status: 'idle',
                    name: 'Subtraction',
                    options: {},
                    tests: [],
                    children: []
                  }
                ]
              }
            ]
          },
          tests: [
            {
              status: 'idle',
              id: 'tests-runner-1',
              name: 'Addition'
            }
          ]
        }
      })

      selfTestsRunner.expect(eventsOrder[3]).toMatchObject({
        event: {
          event: 'test',
          payload: {
            name: 'Subtraction',
            test: selfTestsRunner.expectInstanceOf(TestRunner)
          }
        },
        state: {
          status: 'idle',
          identifier: 'tests-runner',
          nodes: {
            status: 'idle',
            tests: [],
            children: [
              {
                status: 'idle',
                name: 'Arithmetic',
                tests: [
                  {
                    status: 'idle',
                    id: 'tests-runner-1',
                    name: 'Addition'
                  }
                ],
                children: [
                  {
                    status: 'idle',
                    name: 'Subtraction',
                    tests: [
                      {
                        status: 'idle',
                        id: 'tests-runner-2',
                        name: 'Subtraction'
                      }
                    ],
                    children: []
                  }
                ]
              }
            ]
          },
          tests: [
            {
              status: 'idle',
              id: 'tests-runner-1',
              name: 'Addition',
              spec: ['Arithmetic', 'Addition']
            },
            {
              status: 'idle',
              id: 'tests-runner-2',
              name: 'Subtraction',
              spec: ['Arithmetic', 'Subtraction', 'Subtraction']
            }
          ]
        }
      })
      selfTestsRunner.expect(eventsOrder[4]).toMatchObject({
        event: {
          event: 'test',
          payload: {
            name: 'Math failure',
            test: selfTestsRunner.expectInstanceOf(TestRunner)
          }
        },
        state: {
          status: 'idle',
          identifier: 'tests-runner',
          nodes: {
            status: 'idle',
            tests: [],
            children: [
              {
                status: 'idle',
                name: 'Arithmetic',
                tests: [
                  {
                    status: 'idle',
                    id: 'tests-runner-1',
                    name: 'Addition'
                  },
                  {
                    status: 'idle',
                    id: 'tests-runner-3',
                    name: 'Math failure'
                  }
                ],
                children: [
                  {
                    status: 'idle',
                    name: 'Subtraction',
                    tests: [
                      {
                        status: 'idle',
                        id: 'tests-runner-2',
                        name: 'Subtraction'
                      }
                    ],
                    children: []
                  }
                ]
              }
            ]
          },
          tests: [
            {
              status: 'idle',
              id: 'tests-runner-1',
              name: 'Addition',
              spec: ['Arithmetic', 'Addition']
            },
            {
              status: 'idle',
              id: 'tests-runner-2',
              name: 'Subtraction',
              spec: ['Arithmetic', 'Subtraction', 'Subtraction']
            },
            {
              status: 'idle',
              id: 'tests-runner-3',
              name: 'Math failure',
              spec: ['Arithmetic', 'Math failure']
            }
          ]
        }
      })
      selfTestsRunner.expect(eventsOrder[5]).toMatchObject({
        event: {
          event: 'preparing',
          payload: {
            startedAt: selfTestsRunner.expectInstanceOf(Date)
          }
        },
        state: {
          status: 'preparing',
          identifier: 'tests-runner',
          nodes: {
            status: 'idle',
            tests: [],
            children: [
              {
                status: 'idle',
                name: 'Arithmetic',
                tests: [
                  {
                    status: 'idle',
                    id: 'tests-runner-1',
                    name: 'Addition'
                  },
                  {
                    status: 'idle',
                    id: 'tests-runner-3',
                    name: 'Math failure'
                  }
                ],
                children: [
                  {
                    status: 'idle',
                    name: 'Subtraction',
                    tests: [
                      {
                        status: 'idle',
                        id: 'tests-runner-2',
                        name: 'Subtraction'
                      }
                    ],
                    children: []
                  }
                ]
              }
            ]
          },
          tests: [
            {
              status: 'idle',
              id: 'tests-runner-1',
              name: 'Addition',
              spec: ['Arithmetic', 'Addition']
            },
            {
              status: 'idle',
              id: 'tests-runner-2',
              name: 'Subtraction',
              spec: ['Arithmetic', 'Subtraction', 'Subtraction']
            },
            {
              status: 'idle',
              id: 'tests-runner-3',
              name: 'Math failure',
              spec: ['Arithmetic', 'Math failure']
            }
          ]
        }
      })
      selfTestsRunner.expect(eventsOrder[6]).toMatchObject({
        event: {
          event: 'prepared',
          measurement: selfTestsRunner.expectInstanceOf(Measurement),
          payload: {
            startedAt: selfTestsRunner.expectInstanceOf(Date),
            finishedAt: selfTestsRunner.expectInstanceOf(Date)
          }
        },
        state: {
          status: 'preparing',
          identifier: 'tests-runner',
          nodes: {
            status: 'idle',
            tests: [],
            children: [
              {
                status: 'idle',
                name: 'Arithmetic',
                tests: [
                  {
                    status: 'idle',
                    id: 'tests-runner-1',
                    name: 'Addition'
                  },
                  {
                    status: 'idle',
                    id: 'tests-runner-3',
                    name: 'Math failure'
                  }
                ],
                children: [
                  {
                    status: 'idle',
                    name: 'Subtraction',
                    tests: [
                      {
                        status: 'idle',
                        id: 'tests-runner-2',
                        name: 'Subtraction'
                      }
                    ],
                    children: []
                  }
                ]
              }
            ]
          },
          tests: [
            {
              status: 'idle',
              id: 'tests-runner-1',
              name: 'Addition',
              spec: ['Arithmetic', 'Addition']
            },
            {
              status: 'idle',
              id: 'tests-runner-2',
              name: 'Subtraction',
              spec: ['Arithmetic', 'Subtraction', 'Subtraction']
            },
            {
              status: 'idle',
              id: 'tests-runner-3',
              name: 'Math failure',
              spec: ['Arithmetic', 'Math failure']
            }
          ]
        }
      })
      selfTestsRunner.expect(eventsOrder[7]).toMatchObject({
        event: {
          event: 'running',
          payload: {
            startedAt: selfTestsRunner.expectInstanceOf(Date)
          }
        },
        state: {
          status: 'running',
          identifier: 'tests-runner',
          nodes: {
            status: 'idle',
            tests: [],
            children: [
              {
                status: 'idle',
                name: 'Arithmetic',
                tests: [
                  {
                    status: 'idle',
                    id: 'tests-runner-1',
                    name: 'Addition'
                  },
                  {
                    status: 'idle',
                    id: 'tests-runner-3',
                    name: 'Math failure'
                  }
                ],
                children: [
                  {
                    status: 'idle',
                    name: 'Subtraction',
                    tests: [
                      {
                        status: 'idle',
                        id: 'tests-runner-2',
                        name: 'Subtraction'
                      }
                    ],
                    children: []
                  }
                ]
              }
            ]
          },
          tests: [
            {
              status: 'idle',
              id: 'tests-runner-1',
              name: 'Addition',
              spec: ['Arithmetic', 'Addition']
            },
            {
              status: 'idle',
              id: 'tests-runner-2',
              name: 'Subtraction',
              spec: ['Arithmetic', 'Subtraction', 'Subtraction']
            },
            {
              status: 'idle',
              id: 'tests-runner-3',
              name: 'Math failure',
              spec: ['Arithmetic', 'Math failure']
            }
          ]
        }
      })
      selfTestsRunner.expect(eventsOrder[8]).toMatchObject({
        event: {
          event: 'test:preparing',
          payload: {
            startedAt: selfTestsRunner.expectInstanceOf(Date),
            test: selfTestsRunner.expectInstanceOf(TestRunner)
          }
        },
        state: {
          status: 'running',
          identifier: 'tests-runner',
          nodes: {
            status: 'running',
            tests: [],
            children: [
              {
                status: 'running',
                name: 'Arithmetic',
                tests: [
                  {
                    status: 'preparing',
                    id: 'tests-runner-1',
                    name: 'Addition'
                  },
                  {
                    status: 'idle',
                    id: 'tests-runner-3',
                    name: 'Math failure'
                  }
                ],
                children: [
                  {
                    status: 'idle',
                    name: 'Subtraction',
                    tests: [
                      {
                        status: 'idle',
                        id: 'tests-runner-2',
                        name: 'Subtraction'
                      }
                    ],
                    children: []
                  }
                ]
              }
            ]
          },
          tests: [
            {
              status: 'preparing',
              id: 'tests-runner-1',
              name: 'Addition',
              spec: ['Arithmetic', 'Addition']
            },
            {
              status: 'idle',
              id: 'tests-runner-2',
              name: 'Subtraction',
              spec: ['Arithmetic', 'Subtraction', 'Subtraction']
            },
            {
              status: 'idle',
              id: 'tests-runner-3',
              name: 'Math failure',
              spec: ['Arithmetic', 'Math failure']
            }
          ]
        }
      })

      selfTestsRunner.expect(eventsOrder[9]).toMatchObject({
        event: {
          event: 'test:prepared',
          payload: {
            startedAt: selfTestsRunner.expectInstanceOf(Date),
            finishedAt: selfTestsRunner.expectInstanceOf(Date),
            test: selfTestsRunner.expectInstanceOf(TestRunner)
          }
        },
        state: {
          status: 'running',
          identifier: 'tests-runner',
          nodes: {
            status: 'running',
            tests: [],
            children: [
              {
                status: 'running',
                name: 'Arithmetic',
                tests: [
                  {
                    status: 'preparing',
                    id: 'tests-runner-1',
                    name: 'Addition'
                  },
                  {
                    status: 'idle',
                    id: 'tests-runner-3',
                    name: 'Math failure'
                  }
                ],
                children: [
                  {
                    status: 'idle',
                    name: 'Subtraction',
                    tests: [
                      {
                        status: 'idle',
                        id: 'tests-runner-2',
                        name: 'Subtraction'
                      }
                    ],
                    children: []
                  }
                ]
              }
            ]
          },
          tests: [
            {
              status: 'preparing',
              id: 'tests-runner-1',
              name: 'Addition',
              spec: ['Arithmetic', 'Addition']
            },
            {
              status: 'idle',
              id: 'tests-runner-2',
              name: 'Subtraction',
              spec: ['Arithmetic', 'Subtraction', 'Subtraction']
            },
            {
              status: 'idle',
              id: 'tests-runner-3',
              name: 'Math failure',
              spec: ['Arithmetic', 'Math failure']
            }
          ]
        }
      })

      selfTestsRunner.expect(eventsOrder[10]).toMatchObject({
        event: {
          event: 'test:running',
          payload: {
            startedAt: selfTestsRunner.expectInstanceOf(Date),
            test: selfTestsRunner.expectInstanceOf(TestRunner)
          }
        },
        state: {
          status: 'running',
          identifier: 'tests-runner',
          nodes: {
            status: 'running',
            tests: [],
            children: [
              {
                status: 'running',
                name: 'Arithmetic',
                tests: [
                  {
                    status: 'running',
                    id: 'tests-runner-1',
                    name: 'Addition'
                  },
                  {
                    status: 'idle',
                    id: 'tests-runner-3',
                    name: 'Math failure'
                  }
                ],
                children: [
                  {
                    status: 'idle',
                    name: 'Subtraction',
                    tests: [
                      {
                        status: 'idle',
                        id: 'tests-runner-2',
                        name: 'Subtraction'
                      }
                    ],
                    children: []
                  }
                ]
              }
            ]
          },
          tests: [
            {
              status: 'running',
              id: 'tests-runner-1',
              name: 'Addition',
              spec: ['Arithmetic', 'Addition']
            },
            {
              status: 'idle',
              id: 'tests-runner-2',
              name: 'Subtraction',
              spec: ['Arithmetic', 'Subtraction', 'Subtraction']
            },
            {
              status: 'idle',
              id: 'tests-runner-3',
              name: 'Math failure',
              spec: ['Arithmetic', 'Math failure']
            }
          ]
        }
      })

      selfTestsRunner.expect(eventsOrder[11]).toMatchObject({
        event: {
          event: 'test:releasing',
          payload: {
            startedAt: selfTestsRunner.expectInstanceOf(Date),
            test: selfTestsRunner.expectInstanceOf(TestRunner)
          }
        },
        state: {
          status: 'running',
          identifier: 'tests-runner',
          nodes: {
            status: 'running',
            tests: [],
            children: [
              {
                status: 'running',
                name: 'Arithmetic',
                tests: [
                  {
                    status: 'releasing',
                    id: 'tests-runner-1',
                    name: 'Addition'
                  },
                  {
                    status: 'idle',
                    id: 'tests-runner-3',
                    name: 'Math failure'
                  }
                ],
                children: [
                  {
                    status: 'idle',
                    name: 'Subtraction',
                    tests: [
                      {
                        status: 'idle',
                        id: 'tests-runner-2',
                        name: 'Subtraction'
                      }
                    ],
                    children: []
                  }
                ]
              }
            ]
          },
          tests: [
            {
              status: 'releasing',
              id: 'tests-runner-1',
              name: 'Addition',
              spec: ['Arithmetic', 'Addition']
            },
            {
              status: 'idle',
              id: 'tests-runner-2',
              name: 'Subtraction',
              spec: ['Arithmetic', 'Subtraction', 'Subtraction']
            },
            {
              status: 'idle',
              id: 'tests-runner-3',
              name: 'Math failure',
              spec: ['Arithmetic', 'Math failure']
            }
          ]
        }
      })

      selfTestsRunner.expect(eventsOrder[12]).toMatchObject({
        event: {
          event: 'test:released',
          payload: {
            startedAt: selfTestsRunner.expectInstanceOf(Date),
            finishedAt: selfTestsRunner.expectInstanceOf(Date),
            test: selfTestsRunner.expectInstanceOf(TestRunner)
          }
        },
        state: {
          status: 'running',
          identifier: 'tests-runner',
          nodes: {
            status: 'running',
            tests: [],
            children: [
              {
                status: 'running',
                name: 'Arithmetic',
                tests: [
                  {
                    status: 'releasing',
                    id: 'tests-runner-1',
                    name: 'Addition'
                  },
                  {
                    status: 'idle',
                    id: 'tests-runner-3',
                    name: 'Math failure'
                  }
                ],
                children: [
                  {
                    status: 'idle',
                    name: 'Subtraction',
                    tests: [
                      {
                        status: 'idle',
                        id: 'tests-runner-2',
                        name: 'Subtraction'
                      }
                    ],
                    children: []
                  }
                ]
              }
            ]
          },
          tests: [
            {
              status: 'releasing',
              id: 'tests-runner-1',
              name: 'Addition',
              spec: ['Arithmetic', 'Addition']
            },
            {
              status: 'idle',
              id: 'tests-runner-2',
              name: 'Subtraction',
              spec: ['Arithmetic', 'Subtraction', 'Subtraction']
            },
            {
              status: 'idle',
              id: 'tests-runner-3',
              name: 'Math failure',
              spec: ['Arithmetic', 'Math failure']
            }
          ]
        }
      })

      selfTestsRunner.expect(eventsOrder[13]).toMatchObject({
        event: {
          event: 'test:succeeded',
          payload: {
            startedAt: selfTestsRunner.expectInstanceOf(Date),
            finishedAt: selfTestsRunner.expectInstanceOf(Date),
            test: selfTestsRunner.expectInstanceOf(TestRunner)
          }
        },
        state: {
          status: 'running',
          identifier: 'tests-runner',
          nodes: {
            status: 'running',
            tests: [],
            children: [
              {
                status: 'running',
                name: 'Arithmetic',
                tests: [
                  {
                    status: 'succeeded',
                    id: 'tests-runner-1',
                    name: 'Addition'
                  },
                  {
                    status: 'idle',
                    id: 'tests-runner-3',
                    name: 'Math failure'
                  }
                ],
                children: [
                  {
                    status: 'idle',
                    name: 'Subtraction',
                    tests: [
                      {
                        status: 'idle',
                        id: 'tests-runner-2',
                        name: 'Subtraction'
                      }
                    ],
                    children: []
                  }
                ]
              }
            ]
          },
          tests: [
            {
              status: 'succeeded',
              id: 'tests-runner-1',
              name: 'Addition',
              spec: ['Arithmetic', 'Addition']
            },
            {
              status: 'idle',
              id: 'tests-runner-2',
              name: 'Subtraction',
              spec: ['Arithmetic', 'Subtraction', 'Subtraction']
            },
            {
              status: 'idle',
              id: 'tests-runner-3',
              name: 'Math failure',
              spec: ['Arithmetic', 'Math failure']
            }
          ]
        }
      })

      selfTestsRunner.expect(eventsOrder[14]).toMatchObject({
        event: {
          event: 'test:preparing',
          payload: {
            startedAt: selfTestsRunner.expectInstanceOf(Date),
            test: selfTestsRunner.expectInstanceOf(TestRunner)
          }
        },
        state: {
          status: 'running',
          identifier: 'tests-runner',
          nodes: {
            status: 'running',
            tests: [],
            children: [
              {
                status: 'running',
                name: 'Arithmetic',
                tests: [
                  {
                    status: 'succeeded',
                    id: 'tests-runner-1',
                    name: 'Addition'
                  },
                  {
                    status: 'idle',
                    id: 'tests-runner-3',
                    name: 'Math failure'
                  }
                ],
                children: [
                  {
                    status: 'running',
                    name: 'Subtraction',
                    tests: [
                      {
                        status: 'preparing',
                        id: 'tests-runner-2',
                        name: 'Subtraction'
                      }
                    ],
                    children: []
                  }
                ]
              }
            ]
          },
          tests: [
            {
              status: 'succeeded',
              id: 'tests-runner-1',
              name: 'Addition',
              spec: ['Arithmetic', 'Addition']
            },
            {
              status: 'preparing',
              id: 'tests-runner-2',
              name: 'Subtraction',
              spec: ['Arithmetic', 'Subtraction', 'Subtraction']
            },
            {
              status: 'idle',
              id: 'tests-runner-3',
              name: 'Math failure',
              spec: ['Arithmetic', 'Math failure']
            }
          ]
        }
      })

      selfTestsRunner.expect(eventsOrder[15]).toMatchObject({
        event: {
          event: 'test:prepared',
          payload: {
            startedAt: selfTestsRunner.expectInstanceOf(Date),
            finishedAt: selfTestsRunner.expectInstanceOf(Date),
            test: selfTestsRunner.expectInstanceOf(TestRunner)
          }
        },
        state: {
          status: 'running',
          identifier: 'tests-runner',
          nodes: {
            status: 'running',
            tests: [],
            children: [
              {
                status: 'running',
                name: 'Arithmetic',
                tests: [
                  {
                    status: 'succeeded',
                    id: 'tests-runner-1',
                    name: 'Addition'
                  },
                  {
                    status: 'idle',
                    id: 'tests-runner-3',
                    name: 'Math failure'
                  }
                ],
                children: [
                  {
                    status: 'running',
                    name: 'Subtraction',
                    tests: [
                      {
                        status: 'preparing',
                        id: 'tests-runner-2',
                        name: 'Subtraction'
                      }
                    ],
                    children: []
                  }
                ]
              }
            ]
          },
          tests: [
            {
              status: 'succeeded',
              id: 'tests-runner-1',
              name: 'Addition'
            },
            {
              status: 'preparing',
              id: 'tests-runner-2',
              name: 'Subtraction'
            },
            {
              status: 'idle',
              id: 'tests-runner-3',
              name: 'Math failure'
            }
          ]
        }
      })

      selfTestsRunner.expect(eventsOrder[16]).toMatchObject({
        event: {
          event: 'test:running',
          payload: {
            startedAt: selfTestsRunner.expectInstanceOf(Date),
            test: selfTestsRunner.expectInstanceOf(TestRunner)
          }
        },
        state: {
          status: 'running',
          identifier: 'tests-runner',
          nodes: {
            status: 'running',
            tests: [],
            children: [
              {
                status: 'running',
                name: 'Arithmetic',
                tests: [
                  {
                    status: 'succeeded',
                    id: 'tests-runner-1',
                    name: 'Addition'
                  },
                  {
                    status: 'idle',
                    id: 'tests-runner-3',
                    name: 'Math failure'
                  }
                ],
                children: [
                  {
                    status: 'running',
                    name: 'Subtraction',
                    tests: [
                      {
                        status: 'running',
                        id: 'tests-runner-2',
                        name: 'Subtraction'
                      }
                    ],
                    children: []
                  }
                ]
              }
            ]
          },
          tests: [
            {
              status: 'succeeded',
              id: 'tests-runner-1',
              name: 'Addition'
            },
            {
              status: 'running',
              id: 'tests-runner-2',
              name: 'Subtraction'
            },
            {
              status: 'idle',
              id: 'tests-runner-3',
              name: 'Math failure'
            }
          ]
        }
      })

      selfTestsRunner.expect(eventsOrder[17]).toMatchObject({
        event: {
          event: 'test:releasing',
          payload: {
            startedAt: selfTestsRunner.expectInstanceOf(Date),
            test: selfTestsRunner.expectInstanceOf(TestRunner)
          }
        },
        state: {
          status: 'running',
          identifier: 'tests-runner',
          nodes: {
            status: 'running',
            tests: [],
            children: [
              {
                status: 'running',
                name: 'Arithmetic',
                tests: [
                  {
                    status: 'succeeded',
                    id: 'tests-runner-1',
                    name: 'Addition'
                  },
                  {
                    status: 'idle',
                    id: 'tests-runner-3',
                    name: 'Math failure'
                  }
                ],
                children: [
                  {
                    status: 'running',
                    name: 'Subtraction',
                    tests: [
                      {
                        status: 'releasing',
                        id: 'tests-runner-2',
                        name: 'Subtraction'
                      }
                    ],
                    children: []
                  }
                ]
              }
            ]
          },
          tests: [
            {
              status: 'succeeded',
              id: 'tests-runner-1',
              name: 'Addition',
              spec: ['Arithmetic', 'Addition']
            },
            {
              status: 'releasing',
              id: 'tests-runner-2',
              name: 'Subtraction',
              spec: ['Arithmetic', 'Subtraction', 'Subtraction']
            },
            {
              status: 'idle',
              id: 'tests-runner-3',
              name: 'Math failure',
              spec: ['Arithmetic', 'Math failure']
            }
          ]
        }
      })

      selfTestsRunner.expect(eventsOrder[18]).toMatchObject({
        event: {
          event: 'test:released',
          payload: {
            startedAt: selfTestsRunner.expectInstanceOf(Date),
            finishedAt: selfTestsRunner.expectInstanceOf(Date),
            test: selfTestsRunner.expectInstanceOf(TestRunner)
          }
        },
        state: {
          status: 'running',
          identifier: 'tests-runner',
          nodes: {
            status: 'running',
            tests: [],
            children: [
              {
                status: 'running',
                name: 'Arithmetic',
                tests: [
                  {
                    status: 'succeeded',
                    id: 'tests-runner-1',
                    name: 'Addition'
                  },
                  {
                    status: 'idle',
                    id: 'tests-runner-3',
                    name: 'Math failure'
                  }
                ],
                children: [
                  {
                    status: 'running',
                    name: 'Subtraction',
                    tests: [
                      {
                        status: 'releasing',
                        id: 'tests-runner-2',
                        name: 'Subtraction'
                      }
                    ],
                    children: []
                  }
                ]
              }
            ]
          },
          tests: [
            {
              status: 'succeeded',
              id: 'tests-runner-1',
              name: 'Addition',
              spec: ['Arithmetic', 'Addition']
            },
            {
              status: 'releasing',
              id: 'tests-runner-2',
              name: 'Subtraction',
              spec: ['Arithmetic', 'Subtraction', 'Subtraction']
            },
            {
              status: 'idle',
              id: 'tests-runner-3',
              name: 'Math failure',
              spec: ['Arithmetic', 'Math failure']
            }
          ]
        }
      })

      selfTestsRunner.expect(eventsOrder[19]).toMatchObject({
        event: {
          event: 'test:succeeded',
          payload: {
            startedAt: selfTestsRunner.expectInstanceOf(Date),
            finishedAt: selfTestsRunner.expectInstanceOf(Date),
            test: selfTestsRunner.expectInstanceOf(TestRunner)
          }
        },
        state: {
          status: 'running',
          identifier: 'tests-runner',
          nodes: {
            status: 'running',
            tests: [],
            children: [
              {
                status: 'running',
                name: 'Arithmetic',
                tests: [
                  {
                    status: 'succeeded',
                    id: 'tests-runner-1',
                    name: 'Addition'
                  },
                  {
                    status: 'idle',
                    id: 'tests-runner-3',
                    name: 'Math failure'
                  }
                ],
                children: [
                  {
                    status: 'succeeded',
                    name: 'Subtraction',
                    tests: [
                      {
                        status: 'succeeded',
                        id: 'tests-runner-2',
                        name: 'Subtraction'
                      }
                    ],
                    children: []
                  }
                ]
              }
            ]
          },
          tests: [
            {
              status: 'succeeded',
              id: 'tests-runner-1',
              name: 'Addition',
              spec: ['Arithmetic', 'Addition']
            },
            {
              status: 'succeeded',
              id: 'tests-runner-2',
              name: 'Subtraction',
              spec: ['Arithmetic', 'Subtraction', 'Subtraction']
            },
            {
              status: 'idle',
              id: 'tests-runner-3',
              name: 'Math failure',
              spec: ['Arithmetic', 'Math failure']
            }
          ]
        }
      })

      selfTestsRunner.expect(eventsOrder[20]).toMatchObject({
        event: {
          event: 'test:preparing',
          payload: {
            startedAt: selfTestsRunner.expectInstanceOf(Date),
            test: selfTestsRunner.expectInstanceOf(TestRunner)
          }
        },
        state: {
          status: 'running',
          identifier: 'tests-runner',
          nodes: {
            status: 'running',
            tests: [],
            children: [
              {
                status: 'running',
                name: 'Arithmetic',
                tests: [
                  {
                    status: 'succeeded',
                    id: 'tests-runner-1',
                    name: 'Addition'
                  },
                  {
                    status: 'preparing',
                    id: 'tests-runner-3',
                    name: 'Math failure'
                  }
                ],
                children: [
                  {
                    status: 'succeeded',
                    name: 'Subtraction',
                    tests: [
                      {
                        status: 'succeeded',
                        id: 'tests-runner-2',
                        name: 'Subtraction'
                      }
                    ],
                    children: []
                  }
                ]
              }
            ]
          },
          tests: [
            {
              status: 'succeeded',
              id: 'tests-runner-1',
              name: 'Addition',
              spec: ['Arithmetic', 'Addition']
            },
            {
              status: 'succeeded',
              id: 'tests-runner-2',
              name: 'Subtraction',
              spec: ['Arithmetic', 'Subtraction', 'Subtraction']
            },
            {
              status: 'preparing',
              id: 'tests-runner-3',
              name: 'Math failure',
              spec: ['Arithmetic', 'Math failure']
            }
          ]
        }
      })

      selfTestsRunner.expect(eventsOrder[21]).toMatchObject({
        event: {
          event: 'test:prepared',
          payload: {
            startedAt: selfTestsRunner.expectInstanceOf(Date),
            finishedAt: selfTestsRunner.expectInstanceOf(Date),
            test: selfTestsRunner.expectInstanceOf(TestRunner)
          }
        },
        state: {
          status: 'running',
          identifier: 'tests-runner',
          nodes: {
            status: 'running',
            tests: [],
            children: [
              {
                status: 'running',
                name: 'Arithmetic',
                tests: [
                  {
                    status: 'succeeded',
                    id: 'tests-runner-1',
                    name: 'Addition'
                  },
                  {
                    status: 'preparing',
                    id: 'tests-runner-3',
                    name: 'Math failure'
                  }
                ],
                children: [
                  {
                    status: 'succeeded',
                    name: 'Subtraction',
                    tests: [
                      {
                        status: 'succeeded',
                        id: 'tests-runner-2',
                        name: 'Subtraction'
                      }
                    ],
                    children: []
                  }
                ]
              }
            ]
          },
          tests: [
            {
              status: 'succeeded',
              id: 'tests-runner-1',
              name: 'Addition',
              spec: ['Arithmetic', 'Addition']
            },
            {
              status: 'succeeded',
              id: 'tests-runner-2',
              name: 'Subtraction',
              spec: ['Arithmetic', 'Subtraction', 'Subtraction']
            },
            {
              status: 'preparing',
              id: 'tests-runner-3',
              name: 'Math failure',
              spec: ['Arithmetic', 'Math failure']
            }
          ]
        }
      })

      selfTestsRunner.expect(eventsOrder[22]).toMatchObject({
        event: {
          event: 'test:running',
          payload: {
            startedAt: selfTestsRunner.expectInstanceOf(Date),
            test: selfTestsRunner.expectInstanceOf(TestRunner)
          }
        },
        state: {
          status: 'running',
          identifier: 'tests-runner',
          nodes: {
            status: 'running',
            tests: [],
            children: [
              {
                status: 'running',
                name: 'Arithmetic',
                tests: [
                  {
                    status: 'succeeded',
                    id: 'tests-runner-1',
                    name: 'Addition'
                  },
                  {
                    status: 'running',
                    id: 'tests-runner-3',
                    name: 'Math failure'
                  }
                ],
                children: [
                  {
                    status: 'succeeded',
                    name: 'Subtraction',
                    tests: [
                      {
                        status: 'succeeded',
                        id: 'tests-runner-2',
                        name: 'Subtraction'
                      }
                    ],
                    children: []
                  }
                ]
              }
            ]
          },
          tests: [
            {
              status: 'succeeded',
              id: 'tests-runner-1',
              name: 'Addition',
              spec: ['Arithmetic', 'Addition']
            },
            {
              status: 'succeeded',
              id: 'tests-runner-2',
              name: 'Subtraction',
              spec: ['Arithmetic', 'Subtraction', 'Subtraction']
            },
            {
              status: 'running',
              id: 'tests-runner-3',
              name: 'Math failure',
              spec: ['Arithmetic', 'Math failure']
            }
          ]
        }
      })

      selfTestsRunner.expect(eventsOrder[23]).toMatchObject({
        event: {
          event: 'test:releasing',
          payload: {
            startedAt: selfTestsRunner.expectInstanceOf(Date),
            test: selfTestsRunner.expectInstanceOf(TestRunner)
          }
        },
        state: {
          status: 'running',
          identifier: 'tests-runner',
          nodes: {
            status: 'running',
            tests: [],
            children: [
              {
                status: 'running',
                name: 'Arithmetic',
                tests: [
                  {
                    status: 'succeeded',
                    id: 'tests-runner-1',
                    name: 'Addition'
                  },
                  {
                    status: 'releasing',
                    id: 'tests-runner-3',
                    name: 'Math failure'
                  }
                ],
                children: [
                  {
                    status: 'succeeded',
                    name: 'Subtraction',
                    tests: [
                      {
                        status: 'succeeded',
                        id: 'tests-runner-2',
                        name: 'Subtraction'
                      }
                    ],
                    children: []
                  }
                ]
              }
            ]
          },
          tests: [
            {
              status: 'succeeded',
              id: 'tests-runner-1',
              name: 'Addition',
              spec: ['Arithmetic', 'Addition']
            },
            {
              status: 'succeeded',
              id: 'tests-runner-2',
              name: 'Subtraction',
              spec: ['Arithmetic', 'Subtraction', 'Subtraction']
            },
            {
              status: 'releasing',
              id: 'tests-runner-3',
              name: 'Math failure',
              spec: ['Arithmetic', 'Math failure']
            }
          ]
        }
      })

      selfTestsRunner.expect(eventsOrder[24]).toMatchObject({
        event: {
          event: 'test:released',
          payload: {
            startedAt: selfTestsRunner.expectInstanceOf(Date),
            finishedAt: selfTestsRunner.expectInstanceOf(Date),
            test: selfTestsRunner.expectInstanceOf(TestRunner)
          }
        },
        state: {
          status: 'running',
          identifier: 'tests-runner',
          nodes: {
            status: 'running',
            tests: [],
            children: [
              {
                status: 'running',
                name: 'Arithmetic',
                tests: [
                  {
                    status: 'succeeded',
                    id: 'tests-runner-1',
                    name: 'Addition'
                  },
                  {
                    status: 'releasing',
                    id: 'tests-runner-3',
                    name: 'Math failure'
                  }
                ],
                children: [
                  {
                    status: 'succeeded',
                    name: 'Subtraction',
                    tests: [
                      {
                        status: 'succeeded',
                        id: 'tests-runner-2',
                        name: 'Subtraction'
                      }
                    ],
                    children: []
                  }
                ]
              }
            ]
          },
          tests: [
            {
              status: 'succeeded',
              id: 'tests-runner-1',
              name: 'Addition',
              spec: ['Arithmetic', 'Addition']
            },
            {
              status: 'succeeded',
              id: 'tests-runner-2',
              name: 'Subtraction',
              spec: ['Arithmetic', 'Subtraction', 'Subtraction']
            },
            {
              status: 'releasing',
              id: 'tests-runner-3',
              name: 'Math failure',
              spec: ['Arithmetic', 'Math failure']
            }
          ]
        }
      })

      selfTestsRunner.expect(eventsOrder[25]).toMatchObject({
        event: {
          event: 'test:failed',
          payload: {
            reason: selfTestsRunner.expectInstanceOf(TestError),
            startedAt: selfTestsRunner.expectInstanceOf(Date),
            finishedAt: selfTestsRunner.expectInstanceOf(Date),
            test: selfTestsRunner.expectInstanceOf(TestRunner)
          }
        },
        state: {
          status: 'running',
          identifier: 'tests-runner',
          nodes: {
            status: 'failed',
            tests: [],
            children: [
              {
                status: 'failed',
                name: 'Arithmetic',
                tests: [
                  {
                    status: 'succeeded',
                    id: 'tests-runner-1',
                    name: 'Addition'
                  },
                  {
                    status: 'failed',
                    id: 'tests-runner-3',
                    name: 'Math failure'
                  }
                ],
                children: [
                  {
                    status: 'succeeded',
                    name: 'Subtraction',
                    tests: [
                      {
                        status: 'succeeded',
                        id: 'tests-runner-2',
                        name: 'Subtraction'
                      }
                    ],
                    children: []
                  }
                ]
              }
            ]
          },
          tests: [
            {
              status: 'succeeded',
              id: 'tests-runner-1',
              name: 'Addition',
              spec: ['Arithmetic', 'Addition']
            },
            {
              status: 'succeeded',
              id: 'tests-runner-2',
              name: 'Subtraction',
              spec: ['Arithmetic', 'Subtraction', 'Subtraction']
            },
            {
              status: 'failed',
              id: 'tests-runner-3',
              name: 'Math failure',
              spec: ['Arithmetic', 'Math failure']
            }
          ]
        }
      })

      selfTestsRunner.expect(eventsOrder[26]).toMatchObject({
        event: {
          event: 'releasing',
          payload: {
            startedAt: selfTestsRunner.expectInstanceOf(Date)
          }
        },
        state: {
          status: 'releasing',
          identifier: 'tests-runner',
          nodes: {
            status: 'failed',
            tests: [],
            children: [
              {
                status: 'failed',
                name: 'Arithmetic',
                tests: [
                  {
                    status: 'succeeded',
                    id: 'tests-runner-1',
                    name: 'Addition'
                  },
                  {
                    status: 'failed',
                    id: 'tests-runner-3',
                    name: 'Math failure'
                  }
                ],
                children: [
                  {
                    status: 'succeeded',
                    name: 'Subtraction',
                    tests: [
                      {
                        status: 'succeeded',
                        id: 'tests-runner-2',
                        name: 'Subtraction'
                      }
                    ],
                    children: []
                  }
                ]
              }
            ]
          },
          tests: [
            {
              status: 'succeeded',
              id: 'tests-runner-1',
              name: 'Addition',
              spec: ['Arithmetic', 'Addition']
            },
            {
              status: 'succeeded',
              id: 'tests-runner-2',
              name: 'Subtraction',
              spec: ['Arithmetic', 'Subtraction', 'Subtraction']
            },
            {
              status: 'failed',
              id: 'tests-runner-3',
              name: 'Math failure',
              spec: ['Arithmetic', 'Math failure']
            }
          ]
        }
      })

      selfTestsRunner.expect(eventsOrder[27]).toMatchObject({
        event: {
          event: 'released',
          measurement: selfTestsRunner.expectInstanceOf(Measurement),
          payload: {
            startedAt: selfTestsRunner.expectInstanceOf(Date),
            finishedAt: selfTestsRunner.expectInstanceOf(Date)
          }
        },
        state: {
          status: 'releasing',
          identifier: 'tests-runner',
          nodes: {
            status: 'failed',
            tests: [],
            children: [
              {
                status: 'failed',
                name: 'Arithmetic',
                tests: [
                  {
                    status: 'succeeded',
                    id: 'tests-runner-1',
                    name: 'Addition'
                  },
                  {
                    status: 'failed',
                    id: 'tests-runner-3',
                    name: 'Math failure'
                  }
                ],
                children: [
                  {
                    status: 'succeeded',
                    name: 'Subtraction',
                    tests: [
                      {
                        status: 'succeeded',
                        id: 'tests-runner-2',
                        name: 'Subtraction'
                      }
                    ],
                    children: []
                  }
                ]
              }
            ]
          },
          tests: [
            {
              status: 'succeeded',
              id: 'tests-runner-1',
              name: 'Addition',
              spec: ['Arithmetic', 'Addition']
            },
            {
              status: 'succeeded',
              id: 'tests-runner-2',
              name: 'Subtraction',
              spec: ['Arithmetic', 'Subtraction', 'Subtraction']
            },
            {
              status: 'failed',
              id: 'tests-runner-3',
              name: 'Math failure',
              spec: ['Arithmetic', 'Math failure']
            }
          ]
        }
      })

      selfTestsRunner.expect(eventsOrder[28]).toMatchObject({
        event: {
          event: 'failed',
          measurement: selfTestsRunner.expectInstanceOf(Measurement),
          payload: {
            reason: {},
            startedAt: selfTestsRunner.expectInstanceOf(Date),
            finishedAt: selfTestsRunner.expectInstanceOf(Date)
          }
        },
        state: {
          status: 'failed',
          identifier: 'tests-runner',
          nodes: {
            status: 'failed',
            tests: [],
            children: [
              {
                status: 'failed',
                name: 'Arithmetic',
                tests: [
                  {
                    status: 'succeeded',
                    id: 'tests-runner-1',
                    name: 'Addition'
                  },
                  {
                    status: 'failed',
                    id: 'tests-runner-3',
                    name: 'Math failure'
                  }
                ],
                children: [
                  {
                    status: 'succeeded',
                    name: 'Subtraction',
                    tests: [
                      {
                        status: 'succeeded',
                        id: 'tests-runner-2',
                        name: 'Subtraction'
                      }
                    ],
                    children: []
                  }
                ]
              }
            ]
          },
          tests: [
            {
              status: 'succeeded',
              id: 'tests-runner-1',
              name: 'Addition',
              spec: ['Arithmetic', 'Addition']
            },
            {
              status: 'succeeded',
              id: 'tests-runner-2',
              name: 'Subtraction',
              spec: ['Arithmetic', 'Subtraction', 'Subtraction']
            },
            {
              status: 'failed',
              id: 'tests-runner-3',
              name: 'Math failure',
              spec: ['Arithmetic', 'Math failure']
            }
          ]
        }
      })
    })
  })

  await selfTestsRunner.run()

  evaluateTestResults(selfTestsRunner)
}
