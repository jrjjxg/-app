// 获取所有测试
export async function getAllTests() {
  try {
    const response = await fetchAllTests();
    if (response.code === 200 && response.data) {
      return response.data;
    } else {
      console.warn('从API获取测试数据失败，使用本地数据', response);
      return tests; // 如果API请求失败，回退到本地数据
    }
  } catch (error) {
    console.error('获取测试列表失败', error);
    return tests; // 如果API请求出错，回退到本地数据
  }
}

// 根据ID获取测试
export async function getTestById(id) {
  try {
    const response = await fetchTestById(id);
    if (response.code === 200 && response.data) {
      return response.data;
    } else {
      console.warn(`从API获取测试ID=${id}失败，使用本地数据`, response);
      return tests.find(test => test.id === id) || {}; // 如果API请求失败，回退到本地数据
    }
  } catch (error) {
    console.error(`获取测试ID=${id}详情失败`, error);
    return tests.find(test => test.id === id) || {}; // 如果API请求出错，回退到本地数据
  }
}

// 新增：获取测试问题
export async function getTestQuestions(testId) {
  try {
    const response = await fetchTestQuestions(testId);
    if (response.code === 200 && response.data) {
      return response.data;
    } else {
      console.warn(`从API获取测试问题失败，使用本地数据`, response);
      // 从本地测试数据中提取问题
      const test = tests.find(t => t.id === testId) || {};
      return test.questions || [];
    }
  } catch (error) {
    console.error('获取测试问题失败', error);
    // 从本地测试数据中提取问题
    const test = tests.find(t => t.id === testId) || {};
    return test.questions || [];
  }
}

// 新增：提交测试答案
export async function submitTestAnswers(testId, answers) {
  try {
    const response = await submitTestAnswers(testId, answers);
    if (response.code === 200 && response.data) {
      return response.data;
    } else {
      console.error('提交测试答案失败', response);
      throw new Error(response.message || '提交失败');
    }
  } catch (error) {
    console.error('提交测试答案失败', error);
    throw error;
  }
}