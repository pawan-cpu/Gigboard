type JobType = {
    name: string;
    color: string;
  }
  
  const jobTypes: Array<JobType> = [
    {
      name: 'All',
      color: 'green',
    },
    {
      name: 'Frontend',
      color: 'yellow',
    },
    {
      name: 'Backend',
      color: 'red',
    },
    {
      name: 'Contract',
      color: 'green',
    },
    {
      name: 'UI/UX',
      color: 'yellow',
    },
    {
      name: '3D Artist',
      color: 'red',
    },
    {
      name: 'Game',
      color: 'green',
    },
    {
      name: 'Video Editor',
      color: 'yellow',
    },
    {
      name: 'Discord Manager',
      color: 'red',
    },
  ];
  
  type SampleData = {
      type: 'bookmark' | 'bookmarked' | 'finished' | 'failed';
      createDate: number;
      jobType: string;
      jobName: string;
      userView: number;
      userBookmarked: number;
      slackList: Array<string>;
      id: number;
  };
  
  const sampleData: Array<SampleData> = [
    {
      id: 1,
      type: 'bookmarked',
      createDate: 1660146745,
      jobName: 'Frontend Developer',
      jobType: 'Frontend',
      userView: 1234,
      userBookmarked: 1235,
      slackList: ['ruby'],
    },
    {
      id: 2,
      type: 'bookmark',
      createDate: 1660146745,
      jobName: 'Senior Contract Developer',
      jobType: 'Contract',
      userView: 1234,
      userBookmarked: 1235,
      slackList: ['ruby'],
    },
    {
      id: 3,
      type: 'bookmark',
      createDate: 1660146745,
      jobName: 'Backend Developer',
      jobType: 'Backend',
      userView: 1234,
      userBookmarked: 1235,
      slackList: ['ruby'],
    },
  ];
  
  const sampleData2: Array<SampleData> = [
    {
      id: 1,
      type: 'finished',
      createDate: 1660146745,
      jobName: 'Frontend Developer',
      jobType: 'Frontend',
      userView: 1234,
      userBookmarked: 1235,
      slackList: ['ruby'],
    },
    {
      id: 2,
      type: 'finished',
      createDate: 1660146745,
      jobName: 'Senior Contract Developer',
      jobType: 'Contract',
      userView: 1234,
      userBookmarked: 1235,
      slackList: ['ruby'],
    },
    {
      id: 3,
      type: 'failed',
      createDate: 1660146745,
      jobName: 'Backend Developer',
      jobType: 'Backend',
      userView: 1234,
      userBookmarked: 1235,
      slackList: ['ruby'],
    },
  ];
  
  const jobTypeFunctions = () => {
    const tempJobTypes: Array<JobType> = Object.assign([], jobTypes);
    tempJobTypes.splice(0, 1);
    const options = tempJobTypes.map(item => {
      return {
        value: item.name,
        label: item.name
      }
    });
    return options;
  };
  
  const jobTypeOptions = jobTypeFunctions();
  
  /*const stackTypeOptions = [
    {
      label: "React",
      value: "React",
    },
    {
      label: "Angular",
      value: "Angular",
    },
    {
      label: "Vue",
      value: "Vue",
    },
    {
      label: "Next",
      value: "Next",
    },
    {
      label: "Node",
      value: "Node",
    },
    {
      label: "Express",
      value: "Express",
    },
    {
      label: "Python",
      value: "Python",
    },
    {
      label: "Django",
      value: "Django",
    },
    {
      label: "PHP",
      value: "PHP",
    },
    {
      label: "Ruby",
      value: "Ruby",
    },
    {
      label: "Laravel",
      value: "Laravel",
    },
    {
      label: "Java",
      value: "Java",
    },
    {
      label: "Spring Boot",
      value: "Spring Boot",
    },
    {
      label: "Golang",
      value: "Golang",
    },
    {
      label: "Mongodb",
      value: "Mongodb",
    },
    {
      label: "MySQL",
      value: "MySQL",
    },
    {
      label: "PostgreSQL",
      value: "PostgreSQL",
    },
    {
      label: "Unity",
      value: "Unity",
    },
    {
      label: "React Native",
      value: "React Native",
    },
    {
      label: "Kotlin",
      value: "Kotlin",
    },
    {
      label: "Swift",
      value: "Swift",
    },
    {
      label: "Solidity",
      value: "Solidity",
    },
    {
      label: "Rust",
      value: "Rust",
    },
    {
      label: "Docker",
      value: "Docker",
    },
    {
      label: "AWS",
      value: "AWS",
    },
  ];*/

  const stackTypeOptions = [
    {
      value: "React",
      label: "React",
    },
    {
      value: "Angular",
      label: "Angular",
    },
    {
      value: "Vue",
      label: "Vue",
    },
    {
      value: "Next",
      label: "Next",
    },
    {
      value: "Node",
      label: "Node",
    },
    {
      value: "Express",
      label: "Express",
    },
    {
      value: "Python",
      label: "Python",
    },
    {
      value: "Django",
      label: "Django",
    },
    {
      value: "PHP",
      label: "PHP",
    },
    {
      value: "Ruby",
      label: "Ruby",
    },
    {
      value: "Laravel",
      label: "Laravel",
    },
    {
      value: "Java",
      label: "Java",
    },
    {
      value: "Spring Boot",
      label: "Spring Boot",
    },
    {
      value: "Golang",
      label: "Golang",
    },
    {
      value: "Mongodb",
      label: "Mongodb",
    },
    {
      value: "MySQL",
      label: "MySQL",
    },
    {
      value: "PostgreSQL",
      label: "PostgreSQL",
    },
    {
      value: "Unity",
      label: "Unity",
    },
    {
      value: "React Native",
      label: "React Native",
    },
    {
      value: "Kotlin",
      label: "Kotlin",
    },
    {
      value: "Swift",
      label: "Swift",
    },
    {
      value: "Solidity",
      label: "Solidity",
    },
    {
      value: "Rust",
      label: "Rust",
    },
    {
      value: "Docker",
      label: "Docker",
    },
    {
      value: "AWS",
      label: "AWS",
    }
  ];
  
  
  
  export { jobTypes, jobTypeOptions, stackTypeOptions, sampleData, sampleData2 };