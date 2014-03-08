define ->
  config =
    attr:
      'GENDER':
        keyword: 'gender'
        name: '性别'
        options : ['男', '女']
      'AGE':
        keyword: 'age_5'
        name: '年龄'
        options : ['baby', 'child', 'youth', 'middle age', 'senior']
      'RACE':
        keyword: 'race_4'
        name: '种族'
        options : ['白人', '亚洲人', '印度人', '黑人']
    age_range:
      'AGE_RANGE:lower,upper':
        upper: true
        lower: true
      'AGE_RANGE:lower':
        upper: false
        lower: true
      'AGE_RANGE:upper':
        upper: false
        lower: true
  return config
